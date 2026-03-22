import { Link } from "react-router-dom";
import { routePaths } from "../routing/routes";
import "../styles/EmployerPage.css";

function EmployerPage() {
  return (
    <main className="landing-page">
      <section className="employer-hero" id="employer">
        <div className="employer-hero-copy">
          <p className="hero-eyebrow">Employer Dashboard</p>
          <h1>Manage your hiring presence from one place.</h1>
          <p className="hero-copy">
            Use your company profile and the public jobs board from one place.
            Employer-specific listing metrics are intentionally hidden until
            real listing data exists.
          </p>

          <div className="hero-actions">
            <Link className="hero-button hero-button-primary" to={routePaths.jobs}>
              Browse All Jobs
            </Link>
            <Link className="hero-button hero-button-secondary" to={routePaths.employerProfile}>
              View Company Profile
            </Link>
          </div>
        </div>

        <aside className="employer-summary-panel" id="employer-company">
          <p className="employer-summary-label">Company Profile</p>
          <h2>Current employer tools</h2>
          <p>
            This dashboard no longer shows placeholder listing counts or sample
            applicant totals.
          </p>
          <div className="employer-summary-stats">
            <div>
              <strong>Company Profile</strong>
              <span>Edit branding, contact details, and visibility.</span>
            </div>
            <div>
              <strong>Public Job Board</strong>
              <span>Browse real openings while employer listing APIs are absent.</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="preview-section" id="employer-jobs">
        <div className="section-heading">
          <p className="section-label">Listings</p>
          <h2>Employer listing data is not shown here yet</h2>
        </div>
        <p className="page-status">
          Placeholder listings were removed. Use your company profile and the
          public job board until real employer listing endpoints are added.
        </p>
      </section>
    </main>
  );
}

export default EmployerPage;
