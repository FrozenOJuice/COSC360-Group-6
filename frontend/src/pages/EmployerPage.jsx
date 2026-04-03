import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import JobListPanel from "../components/JobListPanel";
import {
  createEmployerJob,
  deleteEmployerJob,
  fetchEmployerJobs,
  updateEmployerJob,
} from "../lib/jobsApi";
import { routePaths } from "../routing/routes";
import "../styles/EmployerPage.css";


function EmployerPage() {
  const { user } = useAuth();
  const [totalJobs, setTotalJobs] = useState(0);

  return (
    <main className="landing-page">
      <section className="employer-hero" id="employer">
        <div className="employer-hero-copy">
          <p className="hero-eyebrow">Employer Dashboard</p>
          <h1>Manage your hiring presence from one place.</h1>
          <p className="hero-copy">
            Create live job listings, update openings as your hiring needs
            change, and remove filled roles without leaving the dashboard.
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
          <p className="employer-summary-label">Hiring Overview</p>
          <h2>{user?.name || "Employer"} listings</h2>
          <p>
            Manage the jobs that currently power the public board. Search and
            edit your listings below without leaving this page.
          </p>
          <div className="employer-summary-stats">
            <div>
              <strong>{totalJobs}</strong>
              <span>jobs in the current scope</span>
            </div>
            <div>
              <strong>Managing</strong>
              <span>live listings</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="employer-management-section" id="employer-jobs">
          <JobListPanel
            loadResource={fetchEmployerJobs}
            fallbackMessage="Could not load employer jobs."
            onCreate={createEmployerJob}
            onUpdate={updateEmployerJob}
            onDelete={deleteEmployerJob}
            canCreate={true}
            onTotalCount={setTotalJobs}
          />
      </section>
    </main>
  );
}

export default EmployerPage;
