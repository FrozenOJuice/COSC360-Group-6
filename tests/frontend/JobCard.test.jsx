import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobCard from '../../frontend/src/components/JobCard.jsx';

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <JobCard {...props} />
    </MemoryRouter>
  );
}

const baseProps = {
  jobId: 'job-1',
  title: 'Frontend Developer',
  company: 'Northstar Labs',
  category: 'Technology',
  jobType: 'Full-time',
  country: 'Canada',
  salary: 80000,
  currency: 'CAD',
  summary: 'Build React applications for our platform.',
};

describe('JobCard — rendering', () => {
  it('renders the job title', () => {
    renderCard(baseProps);
    expect(screen.getByRole('heading', { name: /frontend developer/i })).toBeInTheDocument();
  });

  it('renders the company name as the eyebrow', () => {
    renderCard(baseProps);
    expect(screen.getByText('Northstar Labs')).toBeInTheDocument();
  });

  it('renders the category as the eyebrow when company is not provided', () => {
    renderCard({ ...baseProps, company: undefined });
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders the job type and country as meta', () => {
    renderCard(baseProps);
    expect(screen.getByText(/full-time.*canada/i)).toBeInTheDocument();
  });

  it('renders the formatted salary with currency', () => {
    renderCard(baseProps);
    expect(screen.getByText(/80,000 cad/i)).toBeInTheDocument();
  });

  it('renders the summary text', () => {
    renderCard(baseProps);
    expect(screen.getByText(/build react applications/i)).toBeInTheDocument();
  });

  it('renders a "View Details" link when jobId is provided', () => {
    renderCard(baseProps);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/jobs/job-1');
  });
});

describe('JobCard — optional fields', () => {
  it('does not render meta when neither jobType nor country is given', () => {
    renderCard({ ...baseProps, jobType: undefined, country: undefined });
    expect(screen.queryByText(/•/)).not.toBeInTheDocument();
  });

  it('does not render the summary when it is not provided', () => {
    renderCard({ ...baseProps, summary: undefined });
    expect(screen.queryByText(/build react/i)).not.toBeInTheDocument();
  });

  it('does not render the salary when it is not a number', () => {
    renderCard({ ...baseProps, salary: undefined });
    expect(screen.queryByText(/cad/i)).not.toBeInTheDocument();
  });

  it('renders a disabled button instead of a link when jobId is not provided', () => {
    renderCard({ ...baseProps, jobId: undefined });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view details/i })).toBeDisabled();
  });
});

describe('JobCard — salary formatting', () => {
  it('formats large salaries with thousands separators', () => {
    renderCard({ ...baseProps, salary: 120000 });
    expect(screen.getByText(/120,000/)).toBeInTheDocument();
  });

  it('renders salary 0 correctly', () => {
    renderCard({ ...baseProps, salary: 0 });
    expect(screen.getByText(/0 cad/i)).toBeInTheDocument();
  });

  it('omits currency text when currency is not provided', () => {
    renderCard({ ...baseProps, salary: 80000, currency: undefined });
    expect(screen.getByText(/80,000/)).toBeInTheDocument();
    expect(screen.queryByText(/cad/i)).not.toBeInTheDocument();
  });
});
