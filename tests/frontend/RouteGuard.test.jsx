import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RouteGuard from '../../frontend/src/routing/RouteGuard.jsx';

function renderGuard({
  authLoading = false,
  authUser = null,
  publicOnly = false,
  requiredRole = '',
  initialPath = '/',
} = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          element={
            <RouteGuard
              authLoading={authLoading}
              authUser={authUser}
              publicOnly={publicOnly}
              requiredRole={requiredRole}
            />
          }
        >
          <Route path="/" element={<div>Protected Page</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/job-seeker" element={<div>Seeker Page</div>} />
        <Route path="/employer" element={<div>Employer Page</div>} />
        <Route path="/admin" element={<div>Admin Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RouteGuard - loading state', () => {
  it('shows "Checking session..." while auth is loading on a role-required route', () => {
    renderGuard({ authLoading: true, requiredRole: 'seeker' });
    expect(screen.getByText(/checking session/i)).toBeInTheDocument();
  });

  it('shows "Checking session..." while auth is loading on a public-only route', () => {
    renderGuard({ authLoading: true, publicOnly: true });
    expect(screen.getByText(/checking session/i)).toBeInTheDocument();
  });

  it('renders the page normally when auth is loading but no guard is configured', () => {
    renderGuard({ authLoading: true });
    expect(screen.getByText(/protected page/i)).toBeInTheDocument();
  });
});

describe('RouteGuard - publicOnly', () => {
  it('renders the page for unauthenticated users', () => {
    renderGuard({ publicOnly: true, authUser: null });
    expect(screen.getByText(/protected page/i)).toBeInTheDocument();
  });

  it('redirects a logged-in seeker to their dashboard', () => {
    renderGuard({ publicOnly: true, authUser: { role: 'seeker' } });
    expect(screen.getByText(/seeker page/i)).toBeInTheDocument();
  });

  it('redirects a logged-in employer to their dashboard', () => {
    renderGuard({ publicOnly: true, authUser: { role: 'employer' } });
    expect(screen.getByText(/employer page/i)).toBeInTheDocument();
  });

  it('redirects a logged-in admin to their dashboard', () => {
    renderGuard({ publicOnly: true, authUser: { role: 'admin' } });
    expect(screen.getByText(/admin page/i)).toBeInTheDocument();
  });
});

describe('RouteGuard - requiredRole', () => {
  it('renders protected content when user has the exact required role', () => {
    renderGuard({ requiredRole: 'seeker', authUser: { role: 'seeker' } });
    expect(screen.getByText(/protected page/i)).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    renderGuard({ requiredRole: 'seeker', authUser: null });
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('redirects an employer trying to access a seeker page to their own dashboard', () => {
    renderGuard({ requiredRole: 'seeker', authUser: { role: 'employer' } });
    expect(screen.getByText(/employer page/i)).toBeInTheDocument();
  });

  it('redirects a seeker trying to access an admin page to the seeker dashboard', () => {
    renderGuard({ requiredRole: 'admin', authUser: { role: 'seeker' } });
    expect(screen.getByText(/seeker page/i)).toBeInTheDocument();
  });

  it('allows an admin to access an admin-required route', () => {
    renderGuard({ requiredRole: 'admin', authUser: { role: 'admin' } });
    expect(screen.getByText(/protected page/i)).toBeInTheDocument();
  });

  it('redirects an employer away from a seeker-only route to the employer dashboard', () => {
    renderGuard({ requiredRole: 'seeker', authUser: { role: 'employer' } });
    expect(screen.getByText(/employer page/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected page/i)).not.toBeInTheDocument();
  });
});
