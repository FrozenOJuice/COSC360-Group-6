import request from 'supertest';
import app from '../../backend/src/app.js';
import * as adminService from '../../backend/src/services/adminService.js';
import { requireAuth } from '../../backend/src/middleware/requireAuth.js';

jest.mock('../../backend/src/services/adminService.js');
jest.mock('../../backend/src/middleware/requireAuth.js');

const VALID_USER_ID = '64f1a2b3c4d5e6f7a8b9c0d1';

const mockUser = {
  id: VALID_USER_ID,
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'seeker',
  status: 'active',
};

describe('Admin API — requires admin role', () => {
  describe('when authenticated as admin', () => {
    beforeEach(() => {
      requireAuth.mockImplementation((req, _res, next) => {
        req.auth = { userId: 'admin-1', role: 'admin' };
        next();
      });
    });

    describe('GET /api/admin/users', () => {
      it('returns 200 with a paginated user list', async () => {
        adminService.listAdminUsers.mockResolvedValue({ users: [mockUser], total: 1 });

        const res = await request(app).get('/api/admin/users');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });

      it('accepts search and pagination query params', async () => {
        adminService.listAdminUsers.mockResolvedValue({ users: [], total: 0 });

        const res = await request(app).get('/api/admin/users?search=jane&page=1&limit=10');

        expect(res.status).toBe(200);
      });

      it('returns 400 for invalid query parameters', async () => {
        const res = await request(app).get('/api/admin/users?page=abc');
        expect(res.status).toBe(400);
      });
    });

    describe('GET /api/admin/users/:id', () => {
      it('returns 200 with user details', async () => {
        adminService.getManagedUser.mockResolvedValue({ user: mockUser });

        const res = await request(app).get(`/api/admin/users/${VALID_USER_ID}`);

        expect(res.status).toBe(200);
        expect(res.body.data.user.email).toBe('jane@example.com');
      });

      it('returns 400 for a malformed user ID', async () => {
        const res = await request(app).get('/api/admin/users/not-valid-id');
        expect(res.status).toBe(400);
      });

      it('returns 404 when user does not exist', async () => {
        adminService.getManagedUser.mockRejectedValue(
          Object.assign(new Error('User not found'), {
            isAppError: true,
            code: 'USER_NOT_FOUND',
          })
        );

        const res = await request(app).get(`/api/admin/users/${VALID_USER_ID}`);
        expect(res.status).toBe(404);
      });
    });

    describe('PATCH /api/admin/users/:id/status', () => {
      it('returns 200 when admin disables a user', async () => {
        adminService.setManagedUserStatus.mockResolvedValue({
          user: { ...mockUser, status: 'disabled' },
        });

        const res = await request(app)
          .patch(`/api/admin/users/${VALID_USER_ID}/status`)
          .send({ status: 'disabled' });

        expect(res.status).toBe(200);
      });

      it('returns 200 when admin re-activates a user', async () => {
        adminService.setManagedUserStatus.mockResolvedValue({
          user: { ...mockUser, status: 'active' },
        });

        const res = await request(app)
          .patch(`/api/admin/users/${VALID_USER_ID}/status`)
          .send({ status: 'active' });

        expect(res.status).toBe(200);
      });

      it('returns 400 for an invalid status value', async () => {
        const res = await request(app)
          .patch(`/api/admin/users/${VALID_USER_ID}/status`)
          .send({ status: 'banned' });

        expect(res.status).toBe(400);
      });

      it('returns 400 when status field is missing', async () => {
        const res = await request(app)
          .patch(`/api/admin/users/${VALID_USER_ID}/status`)
          .send({});

        expect(res.status).toBe(400);
      });
    });
  });

  describe('when authenticated as a non-admin', () => {
    beforeEach(() => {
      requireAuth.mockImplementation((req, _res, next) => {
        req.auth = { userId: 'seeker-1', role: 'seeker' };
        next();
      });
    });

    it('returns 403 when seeker tries to list users', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(403);
    });

    it('returns 403 when employer tries to update user status', async () => {
      requireAuth.mockImplementation((req, _res, next) => {
        req.auth = { userId: 'emp-1', role: 'employer' };
        next();
      });

      const res = await request(app)
        .patch(`/api/admin/users/${VALID_USER_ID}/status`)
        .send({ status: 'disabled' });

      expect(res.status).toBe(403);
    });
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      requireAuth.mockImplementation((_req, _res, next) => {
        next(
          Object.assign(new Error('Not authenticated'), {
            isAppError: true,
            code: 'UNAUTHORIZED',
          })
        );
      });
    });

    it('returns 401 for all admin endpoints', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });
  });
});
