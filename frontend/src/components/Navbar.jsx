import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { routePaths, withHash } from "../routing/routes";
import "../styles/Navbar.css";

const NAV_BY_VARIANT = {
  public: [
    { to: routePaths.register, label: "Register", muted: true },
    { to: routePaths.login, label: "Login", muted: true },
    { to: routePaths.jobs, label: "Browse Jobs", muted: false },
  ],
  admin: [
    { to: withHash(routePaths.admin, "admin-overview"), label: "Overview", muted: false },
    { to: withHash(routePaths.admin, "admin-users"), label: "Users", muted: true },
    { to: withHash(routePaths.jobs), label: "Browse Jobs", muted: true },
    { label: "Logout", muted: true, action: "logout" },
  ],
  jobSeeker: [
    { to: routePaths.jobs, label: "Browse Jobs", muted: false },
    { to: routePaths.jobSeekerProfile, label: "Profile", muted: true },
    { label: "Logout", muted: true, action: "logout" },
  ],
  employer: [
    { to: routePaths.jobs, label: "Browse Jobs", muted: false },
    { to: routePaths.employerProfile, label: "Company", muted: true },
    { label: "Logout", muted: true, action: "logout" },
  ],
};

function Navbar({ variant = "public" }) {
  const { loading, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_BY_VARIANT[variant] || NAV_BY_VARIANT.public;
  const brandHref = variant === "admin"
    ? routePaths.admin
    : variant === "jobSeeker"
      ? routePaths.jobSeeker
      : variant === "employer"
        ? routePaths.employer
        : withHash(routePaths.home, "top");

  async function handleLogout() {
    const { data, ok } = await logout();

    if (!ok) {
      window.alert(data.message || "Could not log out");
      return;
    }

    navigate(withHash(routePaths.home, "top"));
  }

  return (
    <header className="navbar">
      <Link to={brandHref} className="brand-mark">
        Job Board
      </Link>

      <nav className="buttons-right" aria-label="Primary navigation">
        {links.map((link) => (
          link.action === "logout" ? (
            <button
              key={`${variant}-${link.label}`}
              type="button"
              onClick={handleLogout}
              className={`navbar-button${link.muted ? " navbar-button-muted" : ""}`}
              disabled={loading}
            >
              {link.label}
            </button>
          ) : (
            <Link
              key={`${variant}-${link.label}`}
              to={link.to}
              className={`navbar-button${link.muted ? " navbar-button-muted" : ""}`}
            >
              {link.label}
            </Link>
          )
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
