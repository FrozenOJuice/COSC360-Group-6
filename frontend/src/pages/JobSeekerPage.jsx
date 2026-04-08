import { Link } from "react-router-dom";
import JobPreviewGrid from "../components/JobPreviewGrid";
import { useJobPreviewList } from "../jobs/useJobPreviewList";
import { routePaths } from "../routing/routes";
import "../styles/JobSeekerPage.css";

const SEEKER_DASHBOARD_JOBS_QUERY = Object.freeze({
  limit: 6,
  sortBy: "title",
  sortOrder: "asc",
});

function JobSeekerPage() {
  const { jobs, loading, error } = useJobPreviewList(SEEKER_DASHBOARD_JOBS_QUERY);

  return (
    <main className="landing-page">
      <section className="job-seeker-hero" id="job-seeker">
        <div className="job-seeker-hero-copy">
          <p className="hero-eyebrow">Job Seeker Dashboard</p>
          <h1>Browse open positions.</h1>
          <p className="hero-copy">
            Browse live job listings and keep your profile up to date.
          </p>

          <div className="hero-actions">
            <Link className="hero-button hero-button-primary" to={routePaths.jobs}>
              Browse All Jobs
            </Link>
          </div>
        </div>

        <aside className="job-seeker-profile-preview" id="job-seeker-profile">
          <p className="job-seeker-profile-label">Quick Access</p>
          <h2>Your Tools</h2>
          <div className="job-seeker-profile-stats">
            <div>
              <strong>Profile</strong>
              <span>Update your profile and visibility settings.</span>
            </div>
            <div>
              <strong>Live Jobs</strong>
              <span>Browse open positions below.</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="preview-section" id="job-seeker-jobs">
        <div className="section-heading">
          <p className="section-label">Live Jobs</p>
          <h2>Browse current roles from the job board</h2>
        </div>
        <JobPreviewGrid jobs={jobs} loading={loading} error={error} />
      </section>
    </main>
  );
}

export default JobSeekerPage;
