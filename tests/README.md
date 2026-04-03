# Testing

This folder contains all tests for the COSC360 Group-6 job board application.

## Structure

```
tests/
├── backend/          # API integration tests (Jest + Supertest)
│   ├── setup.js      # Injects test environment variables
│   ├── auth.test.js          # Registration, login, logout, /me
│   ├── jobs.test.js          # Job listing, CRUD, role enforcement
│   ├── discussions.test.js   # Job comment CRUD and auth
│   └── admin.test.js         # Admin user management
└── frontend/         # React component tests (Jest + React Testing Library)
    ├── setup.js              # Loads @testing-library/jest-dom matchers
    ├── __mocks__/            # CSS/file stubs for Jest
    ├── LoginForm.test.jsx    # Login form rendering, validation, submission
    ├── RegisterForm.test.jsx # Registration form validation and role switching
    ├── RouteGuard.test.jsx   # Route protection and role-based redirects
    └── JobCard.test.jsx      # Job card rendering and salary formatting
```

## What Is Tested

| Area | Tests Cover |
|------|------------|
| Auth API | Register (valid, validation errors, duplicate email), Login (valid, wrong password, disabled account), `/me` (auth required), Logout |
| Jobs API | Public listing with search/filter/sort, Job details (valid ID, bad ID, 404), Employer CRUD, Role enforcement (403 for seekers) |
| Discussions API | Get comments (public), Post/update/delete comments (auth required), Ownership enforcement |
| Admin API | List/get/update users (admin only), 403 for non-admins, 401 when unauthenticated |
| LoginForm | Renders all fields, success message, error message, connection error, loading state |
| RegisterForm | Renders fields, client-side validation (short name, mismatched passwords, weak password, bad email), role switching (seeker ↔ employer) |
| RouteGuard | Loading state, public-only redirect, role-required redirect, unauthenticated redirect to login |
| JobCard | Renders title/company/meta/salary/summary, optional fields, salary formatting edge cases |

## Setup — Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Test Architecture

**Backend tests** use [Supertest](https://github.com/ladjs/supertest) to make HTTP requests against the real Express app. The database and service layers are mocked with `jest.mock()` so no MongoDB instance is required.

**Frontend tests** use [React Testing Library](https://testing-library.com/) to render components in a jsdom environment. API calls and the `useAuth` hook are mocked to isolate component logic.
