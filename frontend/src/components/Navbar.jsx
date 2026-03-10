import "../styles/Navbar.css";

const NAV_BY_VARIANT = {
    public: [
        { href: "#register", label: "Register", muted: true },
        { href: "#login", label: "Login", muted: true },
        { href: "#jobs", label: "Browse Jobs", muted: false },
    ],
    jobSeeker: [
        { href: "#job-seeker-jobs", label: "Browse Jobs", muted: false },
        { href: "#job-seeker-profile", label: "Profile", muted: true },
        { href: "#", label: "Logout", muted: true },
    ],
    employer: [
        { href: "#employer-jobs", label: "Browse Jobs", muted: false },
        { href: "#employer-company", label: "Company", muted: true },
        { href: "#", label: "Logout", muted: true },
    ],
};

function Navbar({ variant = "public" }) {
    const links = NAV_BY_VARIANT[variant] || NAV_BY_VARIANT.public;
    const brandHref = variant === "jobSeeker"
        ? "#job-seeker"
        : variant === "employer"
            ? "#employer"
            : "#top";

  return (
    <header className="navbar">
        <a href={brandHref} className="brand-mark">
            Job Board
        </a>

        <nav className="buttons-right" aria-label="Primary navigation">
            {links.map((link) => (
                <a
                    key={`${variant}-${link.label}`}
                    href={link.href}
                    className={`navbar-button${link.muted ? " navbar-button-muted" : ""}`}
                >
                    {link.label}
                </a>
            ))}
        </nav>
    </header>
  );
}

export default Navbar;
