import request from 'supertest';
import app from '../../backend/src/app.js';
import * as jobService from '../../backend/src/services/jobService.js';
import * as jobDiscussionService from '../../backend/src/services/jobDiscussionService.js';
import { requireAuth } from '../../backend/src/middleware/requireAuth.js';

jest.mock('../../backend/src/services/jobService.js');
jest.mock('../../backend/src/services/jobDiscussionService.js');
jest.mock('../../backend/src/middleware/requireAuth.js');

const VALID_JOB_ID = '64f1a2b3c4d5e6f7a8b9c0d1';

const mockJob = {
  id: VALID_JOB_ID,
  title: 'Frontend Developer',
  category: 'Technology',
  country: 'Canada',
  salary: 80000,
  currency: 'CAD',
};

describe('GET /api/jobs', () => {
  it('returns 200 with a list of jobs', async () => {
    jobService.listBoardJobs.mockResolvedValue({ jobs: [mockJob], total: 1 });

    const res = await request(app).get('/api/jobs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('accepts and passes through search query parameters', async () => {
    jobService.listBoardJobs.mockResolvedValue({ jobs: [], total: 0 });

    const res = await request(app).get('/api/jobs?search=developer&country=Canada');

    expect(res.status).toBe(200);
  });

  it('returns 200 with empty list when no jobs match', async () => {
    jobService.listBoardJobs.mockResolvedValue({ jobs: [], total: 0 });

    const res = await request(app).get('/api/jobs?search=zzznomatch');

    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toHaveLength(0);
  });

  it('returns 400 for an invalid sortBy value', async () => {
    const res = await request(app).get('/api/jobs?sortBy=invalid_field');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/jobs/options', () => {
  it('returns 200 with available filter options', async () => {
    jobService.getBoardJobOptions.mockResolvedValue({
      categories: ['Technology', 'Finance'],
      countries: ['Canada', 'USA'],
    });

    const res = await request(app).get('/api/jobs/options');

    expect(res.status).toBe(200);
    expect(res.body.data.categories).toBeDefined();
  });
});

describe('GET /api/jobs/:id', () => {
  it('returns 200 for a valid job ID', async () => {
    jobService.getBoardJob.mockResolvedValue({ job: mockJob });

    const res = await request(app).get(`/api/jobs/${VALID_JOB_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.job.title).toBe('Frontend Developer');
  });

  it('returns 400 for a malformed job ID', async () => {
    const res = await request(app).get('/api/jobs/not-a-valid-id');
    expect(res.status).toBe(400);
  });

  it('returns 404 when job does not exist', async () => {
    jobService.getBoardJob.mockRejectedValue(
      Object.assign(new Error('Job not found'), {
        isAppError: true,
        code: 'NOT_FOUND',
      })
    );

    const res = await request(app).get(`/api/jobs/${VALID_JOB_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('Employer job management', () => {
  beforeEach(() => {
    requireAuth.mockImplementation((req, _res, next) => {
      req.auth = { userId: 'employer-1', role: 'employer' };
      next();
    });
  });

  describe('POST /api/jobs', () => {
    it('returns 201 when employer creates a valid job', async () => {
      jobService.createEmployerJob.mockResolvedValue({ job: mockJob });

      const res = await request(app).post('/api/jobs').send({
        title: 'Frontend Developer',
        category: 'Technology',
        country: 'Canada',
        salary: 80000,
        currency: 'CAD',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.job.title).toBe('Frontend Developer');
    });

    it('returns 400 when required job fields are missing', async () => {
      const res = await request(app).post('/api/jobs').send({
        title: 'Developer',
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 when body is empty', async () => {
      const res = await request(app).post('/api/jobs').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/jobs/:id', () => {
    it('returns 200 when employer updates a job', async () => {
      jobService.updateEmployerJob.mockResolvedValue({
        job: { ...mockJob, title: 'Senior Frontend Dev' },
      });

      const res = await request(app)
        .patch(`/api/jobs/${VALID_JOB_ID}`)
        .send({ title: 'Senior Frontend Dev' });

      expect(res.status).toBe(200);
    });

    it('returns 400 when update body is empty', async () => {
      const res = await request(app).patch(`/api/jobs/${VALID_JOB_ID}`).send({});
      expect(res.status).toBe(400);
    });

    it('returns 404 when job does not exist', async () => {
      jobService.updateEmployerJob.mockRejectedValue(
        Object.assign(new Error('Job not found'), {
          isAppError: true,
          code: 'NOT_FOUND',
        })
      );

      const res = await request(app)
        .patch(`/api/jobs/${VALID_JOB_ID}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('returns 200 when employer deletes their job', async () => {
      jobService.deleteEmployerJob.mockResolvedValue({ deleted: true });

      const res = await request(app).delete(`/api/jobs/${VALID_JOB_ID}`);

      expect(res.status).toBe(200);
    });

    it('returns 400 for a malformed job ID', async () => {
      const res = await request(app).delete('/api/jobs/not-a-valid-id');
      expect(res.status).toBe(400);
    });
  });
});

describe('Role enforcement on employer-only endpoints', () => {
  beforeEach(() => {
    requireAuth.mockImplementation((req, _res, next) => {
      req.auth = { userId: 'seeker-1', role: 'seeker' };
      next();
    });
  });

  it('returns 403 when a seeker tries to create a job', async () => {
    const res = await request(app).post('/api/jobs').send({
      title: 'Frontend Developer',
      category: 'Technology',
      country: 'Canada',
      salary: 80000,
      currency: 'CAD',
    });
    expect(res.status).toBe(403);
  });

  it('returns 403 when a seeker tries to delete a job', async () => {
    const res = await request(app).delete(`/api/jobs/${VALID_JOB_ID}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 when request has no auth', async () => {
    requireAuth.mockImplementation((_req, _res, next) => {
      next(
        Object.assign(new Error('Not authenticated'), {
          isAppError: true,
          code: 'UNAUTHORIZED',
        })
      );
    });

    const res = await request(app).post('/api/jobs').send({
      title: 'Developer',
      category: 'Technology',
      country: 'Canada',
      salary: 80000,
      currency: 'CAD',
    });
    expect(res.status).toBe(401);
  });
});
