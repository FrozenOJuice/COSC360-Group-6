import "../styles/Navbar.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const NAV_BY_VARIANT = {
    public: [
        { label: "Me", muted: true, action: "me" },
        { href: "#register", label: "Register", muted: true },
        { href: "#login", label: "Login", muted: true },
        { href: "#jobs", label: "Browse Jobs", muted: false },
    ],
    jobSeeker: [
        { href: "#job-seeker-jobs", label: "Browse Jobs", muted: false },
        { href: "#job-seeker-profile", label: "Profile", muted: true },
        { label: "Me", muted: true, action: "me" },
        { label: "Logout", muted: true, action: "logout" },
    ],
    employer: [
        { href: "#employer-jobs", label: "Browse Jobs", muted: false },
        { href: "#employer-company", label: "Company", muted: true },
        { label: "Me", muted: true, action: "me" },
        { label: "Logout", muted: true, action: "logout" },
    ],
};

function Navbar({ variant = "public", onLogout }) {
    const links = NAV_BY_VARIANT[variant] || NAV_BY_VARIANT.public;
    const brandHref = variant === "jobSeeker"
        ? "#job-seeker"
        : variant === "employer"
            ? "#employer"
            : "#top";

    async function handleMe() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();
            window.alert(JSON.stringify({
                status: response.status,
                ...data,
            }, null, 2));
        } catch (error) {
            window.alert("Could not connect to /api/auth/me");
        }
    }

    async function handleLogout() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
                window.alert(data.message || "Could not log out");
                return;
            }

            onLogout?.();
        } catch (error) {
            window.alert("Could not connect to /api/auth/logout");
        }
    }

  return (
    <header className="navbar">
        <a href={brandHref} className="brand-mark">
            Job Board
        </a>

        <nav className="buttons-right" aria-label="Primary navigation">
            {links.map((link) => (
                link.action === "me" || link.action === "logout" ? (
                    <button
                        key={`${variant}-${link.label}`}
                        type="button"
                        onClick={link.action === "me" ? handleMe : handleLogout}
                        className={`navbar-button${link.muted ? " navbar-button-muted" : ""}`}
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
