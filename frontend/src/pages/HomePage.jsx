import { Link } from "react-router-dom";
import JobPreviewGrid from "../components/JobPreviewGrid";
import { useJobPreviewList } from "../jobs/useJobPreviewList";
import { routePaths } from "../routing/routes";
import "../styles/App.css";

const FEATURED_JOBS_QUERY = Object.freeze({
  limit: 6,
});

function HomePage() {
  const { jobs, loading, error } = useJobPreviewList(FEATURED_JOBS_QUERY);

  return (
    <main className="landing-page">
      <section className="hero-section" id="top">
        <p className="hero-eyebrow">Job Board</p>
        <h1>Find your next opportunity in one place.</h1>
        <p className="hero-copy">
          Browse current openings, preview featured roles, and create an account
          when you are ready to apply.
        </p>

        <div className="hero-actions">
          <Link className="hero-button hero-button-primary" to={routePaths.jobs}>
            Browse All Jobs
          </Link>
          <Link className="hero-button hero-button-secondary" to={routePaths.register}>
            Create An Account
          </Link>
        </div>
      </section>

      <section className="preview-section" id="jobs">
        <div className="section-heading">
          <p className="section-label">Featured Jobs</p>
          <h2>Preview current opportunities</h2>
        </div>
        <JobPreviewGrid jobs={jobs} loading={loading} error={error} />
      </section>
    </main>
  );
}

export default HomePage;
