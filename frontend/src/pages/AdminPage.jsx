import AdminUsersPanel from "../components/admin/AdminUsersPanel";
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
            <a className="hero-button hero-button-primary" href="#admin-users">
              Manage Users
            </a>
            <a className="hero-button hero-button-secondary" href="#admin-overview">
              Current Scope
            </a>
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

      <section className="admin-overview-grid" id="admin-overview">
        <article className="admin-stat-card">
          <strong>User access</strong>
          <p>Search accounts and change access for non-admin users.</p>
        </article>
        <article className="admin-stat-card">
          <strong>Profile review</strong>
          <p>Open seeker and employer profiles from the user table.</p>
        </article>
        <article className="admin-stat-card">
          <strong>No fake metrics</strong>
          <p>Operational counts stay hidden until real reporting exists.</p>
        </article>
      </section>

      <AdminUsersPanel />
    </main>
  );
}

export default AdminPage;
