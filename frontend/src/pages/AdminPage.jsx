import { Link } from "react-router-dom";
import AdminUsersPanel from "../components/admin/AdminUsersPanel";
import JobListPanel from "../components/JobListPanel";
import { routePaths, withHash } from "../routing/routes";
import {
  updateAdminJob,
  deleteAdminJob,
} from "../lib/adminApi";
import {
  fetchAdminJobs
} from "../lib/jobsApi";
import "../styles/AdminPage.css";

function AdminPage() {
  return (
    <main className="landing-page">
      <section className="admin-hero" id="admin">
        <div className="admin-hero-copy">
          <p className="hero-eyebrow">Admin Dashboard</p>
          <h1>Manage account access from one place.</h1>
          <p className="hero-copy">
            This dashboard currently exposes real user-management tools only.
            Platform analytics and moderation metrics are intentionally omitted
            until they are backed by actual data.
          </p>

          <div className="hero-actions">
            <Link
              className="hero-button hero-button-primary"
              to={withHash(routePaths.admin, "admin-users")}
            >
              Manage Users
            </Link>
            <Link
              className="hero-button hero-button-secondary"
              to={withHash(routePaths.admin, "admin-jobs")}
            >
              Manage Jobs
            </Link>
          </div>
        </div>

        <aside className="admin-priority-panel" id="admin-priority">
          <p className="admin-panel-label">Available Now</p>
          <h2>Current admin scope</h2>
          <p>
            Use the user table below to search accounts, review roles, and
            enable or disable access where permitted.
          </p>
          <p>
            This page no longer shows placeholder health metrics, moderation
            queues, or performance summaries.
          </p>
        </aside>
      </section>

      <AdminUsersPanel />

      <section className="admin-jobs-section" id="admin-jobs">
        <div className="admin-jobs-header">
          <p className="admin-panel-label">Job Management</p>
          <h2>Manage all job listings</h2>
          <p>
            Review and manage all job listings across the platform. Edit job
            details or remove listings as needed.
          </p>
        </div>
        <JobListPanel
          loadResource={fetchAdminJobs}
          fallbackMessage="Could not load jobs."
          onUpdate={updateAdminJob}
          onDelete={deleteAdminJob}
          canCreate={false}
        />
      </section>
    </main>
  );
}

export default AdminPage;
