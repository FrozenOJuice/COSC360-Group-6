import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../../frontend/src/components/forms/LoginForm.jsx';

jest.mock('../../frontend/src/auth/useAuth.js', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '../../frontend/src/auth/useAuth.js';

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm — rendering', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ login: jest.fn() });
  });

  it('renders the email input', () => {
    renderLoginForm();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  });

  it('renders the password input', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the login button', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders a link to the register page', () => {
    renderLoginForm();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });
});

describe('LoginForm — successful login', () => {
  it('shows a success message after logging in', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      ok: true,
      data: { user: { name: 'Jane Smith' } },
    });
    useAuth.mockReturnValue({ login: mockLogin });

    renderLoginForm();

    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass1!');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/logged in as jane smith/i)).toBeInTheDocument();
    });
  });

  it('calls login with the submitted email and password', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      ok: true,
      data: { user: { name: 'Jane Smith' } },
    });
    useAuth.mockReturnValue({ login: mockLogin });

    renderLoginForm();

    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass1!');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'SecurePass1!',
      });
    });
  });
});

describe('LoginForm — failed login', () => {
  it('shows an error message on invalid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      ok: false,
      data: { message: 'Invalid email or password' },
    });
    useAuth.mockReturnValue({ login: mockLogin });

    renderLoginForm();

    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'WrongPass1!');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('shows a connection error when the request throws', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Network error'));
    useAuth.mockReturnValue({ login: mockLogin });

    renderLoginForm();

    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass1!');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not connect to the server/i)).toBeInTheDocument();
    });
  });
});

describe('LoginForm — submitting state', () => {
  it('disables the button and shows "Logging In..." while submitting', async () => {
    const mockLogin = jest.fn().mockReturnValue(new Promise(() => {}));
    useAuth.mockReturnValue({ login: mockLogin });

    renderLoginForm();

    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'SecurePass1!');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });
});
