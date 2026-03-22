import { useAuth } from "../auth/useAuth";
import "../styles/Navbar.css";

const NAV_BY_VARIANT = {
    public: [
        { href: "#register", label: "Register", muted: true },
        { href: "#login", label: "Login", muted: true },
        { href: "#jobs", label: "Browse Jobs", muted: false },
    ],
    admin: [
        { href: "#admin-overview", label: "Overview", muted: false },
        { href: "#admin-users", label: "Users", muted: true },
        { href: "#admin-priority", label: "Priority", muted: true },
        { label: "Logout", muted: true, action: "logout" },
    ],
    jobSeeker: [
        { href: "#jobs", label: "Browse Jobs", muted: false },
        { href: "#job-seeker-profile", label: "Profile", muted: true },
        { label: "Logout", muted: true, action: "logout" },
    ],
    employer: [
        { href: "#jobs", label: "Browse Jobs", muted: false },
        { href: "#employer-profile", label: "Company", muted: true },
        { label: "Logout", muted: true, action: "logout" },
    ],
};

function Navbar({ variant = "public" }) {
  const { loading, logout } = useAuth();
  const links = NAV_BY_VARIANT[variant] || NAV_BY_VARIANT.public;
  const brandHref = variant === "admin"
    ? "#admin"
    : variant === "jobSeeker"
      ? "#job-seeker"
      : variant === "employer"
        ? "#employer"
        : "#top";

  async function handleLogout() {
    const { data, ok } = await logout();

    if (!ok) {
      window.alert(data.message || "Could not log out");
      return;
    }

    window.location.hash = "#top";
  }

  return (
    <header className="navbar">
        <a href={brandHref} className="brand-mark">
            Job Board
        </a>

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
                    <a
                        key={`${variant}-${link.label}`}
                        href={link.href}
                        className={`navbar-button${link.muted ? " navbar-button-muted" : ""}`}
                    >
                        {link.label}
                    </a>
                )
            ))}
        </nav>
    </header>
  );
}

export default Navbar;
