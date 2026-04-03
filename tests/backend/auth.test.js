import request from 'supertest';
import app from '../../backend/src/app.js';
import * as authService from '../../backend/src/services/authService.js';
import { requireAuth } from '../../backend/src/middleware/requireAuth.js';

jest.mock('../../backend/src/services/authService.js');
jest.mock('../../backend/src/services/seekerProfileService.js');
jest.mock('../../backend/src/services/employerProfileService.js');

jest.mock('../../backend/src/middleware/requireAuth.js');

jest.mock('../../backend/src/middleware/rateLimit.js', () => ({
  registerRateLimit: (_req, _res, next) => next(),
  loginRateLimit: (_req, _res, next) => next(),
  refreshRateLimit: (_req, _res, next) => next(),
}));

const mockUser = {
  id: 'user-1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'seeker',
  status: 'active',
};

const mockTokenResult = {
  user: mockUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

describe('POST /api/auth/register', () => {
  it('returns 201 and user data with valid input', async () => {
    authService.registerUser.mockResolvedValue(mockTokenResult);

    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'SecurePass1!',
      confirmPassword: 'SecurePass1!',
      role: 'seeker',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('jane@example.com');
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when passwords do not match', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'SecurePass1!',
      confirmPassword: 'DifferentPass1!',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 with an invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Smith',
      email: 'not-an-email',
      password: 'SecurePass1!',
      confirmPassword: 'SecurePass1!',
    });
    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already in use', async () => {
    authService.registerUser.mockRejectedValue(
      Object.assign(new Error('Email is already registered'), {
        isAppError: true,
        code: 'EMAIL_ALREADY_IN_USE',
      })
    );

    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'SecurePass1!',
      confirmPassword: 'SecurePass1!',
      role: 'seeker',
    });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_ALREADY_IN_USE');
  });

  it('returns 400 when admin role is selected', async () => {
    authService.registerUser.mockRejectedValue(
      Object.assign(new Error('Admin role cannot be selected during registration'), {
        isAppError: true,
        code: 'ROLE_NOT_ALLOWED',
      })
    );

    const res = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'SecurePass1!',
      confirmPassword: 'SecurePass1!',
      role: 'admin',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 and user data with valid credentials', async () => {
    authService.loginUser.mockResolvedValue(mockTokenResult);

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'SecurePass1!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('jane@example.com');
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 with invalid email format', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'somepassword',
    });
    expect(res.status).toBe(400);
  });

  it('returns 401 with wrong password', async () => {
    authService.loginUser.mockRejectedValue(
      Object.assign(new Error('Invalid email or password'), {
        isAppError: true,
        code: 'INVALID_CREDENTIALS',
      })
    );

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'WrongPass1!',
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 403 when account is disabled', async () => {
    authService.loginUser.mockRejectedValue(
      Object.assign(new Error('This account has been disabled'), {
        isAppError: true,
        code: 'ACCOUNT_DISABLED',
      })
    );

    const res = await request(app).post('/api/auth/login').send({
      email: 'disabled@example.com',
      password: 'SecurePass1!',
    });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 when no auth token is provided', async () => {
    requireAuth.mockImplementation((_req, _res, next) => {
      next(
        Object.assign(new Error('Not authenticated'), {
          isAppError: true,
          code: 'UNAUTHORIZED',
        })
      );
    });

    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 200 with the current user when authenticated', async () => {
    requireAuth.mockImplementation((req, _res, next) => {
      req.auth = { userId: 'user-1', role: 'seeker' };
      next();
    });
    authService.getCurrentUser.mockResolvedValue({ user: mockUser });

    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user.role).toBe('seeker');
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and confirms logout', async () => {
    authService.logoutSession.mockResolvedValue({ success: true });

    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.data.loggedOut).toBe(true);
  });

  it('returns 200 even without a refresh token cookie', async () => {
    authService.logoutSession.mockResolvedValue({ success: true });

    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});
