import { Link } from "react-router-dom";
import AdminUsersPanel from "../components/admin/AdminUsersPanel";
import JobListPanel from "../components/JobListPanel";
import { routePaths, withHash, getAdminProfilePath } from "../routing/routes";
import {
  updateAdminJob,
  deleteAdminJob,
} from "../lib/adminApi";
import {
  fetchAdminJobs
} from "../lib/jobsApi";
import "../styles/AdminPage.css";
import { fetchAdminJobApplicants } from "../lib/adminApi";

function AdminPage() {
  return (
    <main className="landing-page">
      <section className="admin-hero" id="admin">
        <div className="admin-hero-copy">
          <p className="hero-eyebrow">Admin Dashboard</p>
          <h1>Manage account access from one place.</h1>
          <p className="hero-copy">
            Manage users, job listings, and platform settings.
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
          <p className="admin-panel-label">Admin Tools</p>
          <h2>User Management</h2>
          <p>Search accounts, review roles, and enable or disable access.</p>
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
          canViewApplicants={true}
          fetchApplicants={fetchAdminJobApplicants}
          getApplicantProfilePath={(userId) => getAdminProfilePath("seeker", userId)}
        />
      </section>
    </main>
  );
}

export default AdminPage;
