import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../../frontend/src/components/forms/RegisterForm.jsx';

jest.mock('../../frontend/src/auth/useAuth.js', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../../frontend/src/lib/seekerProfileApi.js', () => ({
  uploadCurrentSeekerProfilePicture: jest.fn().mockResolvedValue({ ok: true }),
}));
jest.mock('../../frontend/src/profile/ProfileMediaPanel.jsx', () => ({
  __esModule: true,
  default: function MockProfileMediaPanel({ inputLabel }) {
    return <div data-testid="profile-media-panel">{inputLabel || 'Profile Picture'}</div>;
  },
}));

import { useAuth } from '../../frontend/src/auth/useAuth.js';

function renderRegisterForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );
}

describe('RegisterForm — rendering', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ register: jest.fn() });
  });

  it('renders all required input fields', () => {
    renderRegisterForm();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders the account type selector defaulting to Job Seeker', () => {
    renderRegisterForm();
    const select = screen.getByRole('combobox', { name: /account type/i });
    expect(select).toHaveValue('seeker');
  });

  it('renders "Full Name" label for seeker role', () => {
    renderRegisterForm();
    expect(screen.getByText(/full name/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderRegisterForm();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });
});

describe('RegisterForm — role switching', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ register: jest.fn() });
  });

  it('changes the name label to "Company Name" when Employer is selected', async () => {
    renderRegisterForm();

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /account type/i }),
      'employer'
    );

    expect(screen.getByText(/company name/i)).toBeInTheDocument();
  });

  it('hides the profile picture upload when Employer is selected', async () => {
    renderRegisterForm();

    expect(screen.getByTestId('profile-media-panel')).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /account type/i }),
      'employer'
    );

    expect(screen.queryByTestId('profile-media-panel')).not.toBeInTheDocument();
  });
});

describe('RegisterForm — client-side validation', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ register: jest.fn() });
  });

  it('shows an error when name is too short', async () => {
    renderRegisterForm();

    await userEvent.type(screen.getByLabelText(/full name/i), 'J');
    await userEvent.type(screen.getByLabelText(/username/i), 'janesmith');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'j@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('shows an error when passwords do not match', async () => {
    renderRegisterForm();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await userEvent.type(screen.getByLabelText(/username/i), 'janesmith');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'DifferentPass1!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows an error when password does not meet complexity requirements', async () => {
    renderRegisterForm();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await userEvent.type(screen.getByLabelText(/username/i), 'janesmith');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'weakpass');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'weakpass');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/uppercase, lowercase, number, and symbol/i)).toBeInTheDocument();
    });
  });

  it('shows an error for an invalid email address', async () => {
    renderRegisterForm();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'not-an-email' },
    });
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('does not call register when validation fails', async () => {
    const mockRegister = jest.fn();
    useAuth.mockReturnValue({ register: mockRegister });

    renderRegisterForm();

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/please fix the highlighted errors/i)).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });
});

describe('RegisterForm — successful registration', () => {
  it('shows a success message after registration', async () => {
    const mockRegister = jest.fn().mockResolvedValue({
      ok: true,
      data: { user: { name: 'Jane Smith' } },
    });
    useAuth.mockReturnValue({ register: mockRegister });

    renderRegisterForm();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await userEvent.type(screen.getByLabelText(/username/i), 'janesmith');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/account created for jane smith/i)).toBeInTheDocument();
    });
  });
});

describe('RegisterForm — server errors', () => {
  it('shows an error message when the server says email is taken', async () => {
    const mockRegister = jest.fn().mockResolvedValue({
      ok: false,
      data: { message: 'Email is already registered' },
    });
    useAuth.mockReturnValue({ register: mockRegister });

    renderRegisterForm();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await userEvent.type(screen.getByLabelText(/username/i), 'janesmith');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is already registered/i)).toBeInTheDocument();
    });
  });
});
