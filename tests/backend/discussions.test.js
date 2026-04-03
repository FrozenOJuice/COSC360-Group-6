import request from 'supertest';
import app from '../../backend/src/app.js';
import * as jobDiscussionService from '../../backend/src/services/jobDiscussionService.js';
import { requireAuth } from '../../backend/src/middleware/requireAuth.js';

jest.mock('../../backend/src/services/jobDiscussionService.js');
jest.mock('../../backend/src/middleware/requireAuth.js');

const VALID_JOB_ID = '64f1a2b3c4d5e6f7a8b9c0d1';
const VALID_COMMENT_ID = '64f1a2b3c4d5e6f7a8b9c0d2';

const mockComment = {
  id: VALID_COMMENT_ID,
  jobId: VALID_JOB_ID,
  userId: 'user-1',
  userName: 'Jane Smith',
  comment: 'Is this role remote-friendly?',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('GET /api/jobs/:id/discussion', () => {
  it('returns 200 with comments for a valid job', async () => {
    jobDiscussionService.getJobDiscussion.mockResolvedValue({
      comments: [mockComment],
      total: 1,
    });

    const res = await request(app).get(`/api/jobs/${VALID_JOB_ID}/discussion`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for a malformed job ID', async () => {
    const res = await request(app).get('/api/jobs/not-valid/discussion');
    expect(res.status).toBe(400);
  });

  it('returns 200 with an empty list when there are no comments', async () => {
    jobDiscussionService.getJobDiscussion.mockResolvedValue({ comments: [], total: 0 });

    const res = await request(app).get(`/api/jobs/${VALID_JOB_ID}/discussion`);

    expect(res.status).toBe(200);
  });
});

describe('POST /api/jobs/:id/discussion', () => {
  beforeEach(() => {
    requireAuth.mockImplementation((req, _res, next) => {
      req.auth = { userId: 'user-1', role: 'seeker' };
      next();
    });
  });

  it('returns 201 when an authenticated user posts a comment', async () => {
    jobDiscussionService.addJobComment.mockResolvedValue({ comment: mockComment });

    const res = await request(app)
      .post(`/api/jobs/${VALID_JOB_ID}/discussion`)
      .send({ comment: 'Is this role remote-friendly?' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when comment is empty', async () => {
    const res = await request(app)
      .post(`/api/jobs/${VALID_JOB_ID}/discussion`)
      .send({ comment: '' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when comment field is missing', async () => {
    const res = await request(app)
      .post(`/api/jobs/${VALID_JOB_ID}/discussion`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 401 when user is not authenticated', async () => {
    requireAuth.mockImplementation((_req, _res, next) => {
      next(
        Object.assign(new Error('Not authenticated'), {
          isAppError: true,
          code: 'UNAUTHORIZED',
        })
      );
    });

    const res = await request(app)
      .post(`/api/jobs/${VALID_JOB_ID}/discussion`)
      .send({ comment: 'Hello' });

    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/jobs/:id/discussion/:commentId', () => {
  beforeEach(() => {
    requireAuth.mockImplementation((req, _res, next) => {
      req.auth = { userId: 'user-1', role: 'seeker' };
      next();
    });
  });

  it('returns 200 when user updates their own comment', async () => {
    jobDiscussionService.updateJobComment.mockResolvedValue({
      comment: { ...mockComment, comment: 'Updated question' },
    });

    const res = await request(app)
      .patch(`/api/jobs/${VALID_JOB_ID}/discussion/${VALID_COMMENT_ID}`)
      .send({ comment: 'Updated question' });

    expect(res.status).toBe(200);
  });

  it('returns 400 when comment field is missing from update body', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${VALID_JOB_ID}/discussion/${VALID_COMMENT_ID}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 404 when comment does not exist', async () => {
    jobDiscussionService.updateJobComment.mockRejectedValue(
      Object.assign(new Error('Comment not found'), {
        isAppError: true,
        code: 'NOT_FOUND',
      })
    );

    const res = await request(app)
      .patch(`/api/jobs/${VALID_JOB_ID}/discussion/${VALID_COMMENT_ID}`)
      .send({ comment: 'Updated question' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/jobs/:id/discussion/:commentId', () => {
  beforeEach(() => {
    requireAuth.mockImplementation((req, _res, next) => {
      req.auth = { userId: 'user-1', role: 'seeker' };
      next();
    });
  });

  it('returns 200 when user deletes their own comment', async () => {
    jobDiscussionService.deleteJobComment.mockResolvedValue({ deleted: true });

    const res = await request(app).delete(
      `/api/jobs/${VALID_JOB_ID}/discussion/${VALID_COMMENT_ID}`
    );

    expect(res.status).toBe(200);
  });

  it('returns 400 for a malformed comment ID', async () => {
    const res = await request(app).delete(
      `/api/jobs/${VALID_JOB_ID}/discussion/not-a-valid-id`
    );

    expect(res.status).toBe(400);
  });

  it('returns 403 when user tries to delete another users comment', async () => {
    jobDiscussionService.deleteJobComment.mockRejectedValue(
      Object.assign(new Error('You do not have permission'), {
        isAppError: true,
        code: 'ROLE_NOT_ALLOWED',
      })
    );

    const res = await request(app).delete(
      `/api/jobs/${VALID_JOB_ID}/discussion/${VALID_COMMENT_ID}`
    );

    expect(res.status).toBe(403);
  });
});
