import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import EmployerPage from "./pages/EmployerPage";
import HomePage from "./pages/HomePage";
import JobSeekerPage from "./pages/JobSeekerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import {
  getCurrentPage,
  getLandingHash,
  getRequiredRoleForPage,
} from "./lib/authRoutes";
import "./styles/App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const [authUser, setAuthUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (cancelled) return;
        setAuthUser(response.ok ? data.user : null);
      } catch (error) {
        if (!cancelled) {
          setAuthUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthResolved(true);
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPage = getCurrentPage(hash);
  const requiredRole = getRequiredRoleForPage(currentPage);
  const navbarVariant = currentPage === "jobSeeker" && authUser?.role === "seeker"
    ? "jobSeeker"
    : currentPage === "employer" && authUser?.role === "employer"
      ? "employer"
      : "public";

  useEffect(() => {
    if (!authResolved) return;

    if (requiredRole) {
      if (!authUser) {
        if (window.location.hash !== "#login") {
          window.location.hash = "#login";
        }
        return;
      }

      if (authUser.role !== requiredRole) {
        const landingHash = getLandingHash(authUser.role);
        if (window.location.hash !== landingHash) {
          window.location.hash = landingHash;
        }
      }
      return;
    }

    if (authUser && (currentPage === "login" || currentPage === "register")) {
      const landingHash = getLandingHash(authUser.role);
      if (window.location.hash !== landingHash) {
        window.location.hash = landingHash;
      }
    }
  }, [authResolved, authUser, currentPage, requiredRole]);

  function handleAuthSuccess(user) {
    setAuthUser(user);
    setAuthResolved(true);
    window.location.hash = getLandingHash(user.role);
  }

  function handleLogout() {
    setAuthUser(null);
    setAuthResolved(true);
    window.location.hash = "#top";
  }

  const shouldShowProtectedPage =
    authResolved && authUser && (!requiredRole || authUser.role === requiredRole);

  return (
    <div className="app-shell">
      <Navbar variant={navbarVariant} onLogout={handleLogout} />
      {!authResolved && requiredRole ? (
        <main className="page-status">Checking session...</main>
      ) : null}
      {currentPage === "employer" && shouldShowProtectedPage ? <EmployerPage /> : null}
      {currentPage === "jobSeeker" && shouldShowProtectedPage ? <JobSeekerPage /> : null}
      {currentPage === "login" ? <LoginPage onAuthSuccess={handleAuthSuccess} /> : null}
      {currentPage === "register" ? <RegisterPage onAuthSuccess={handleAuthSuccess} /> : null}
      {currentPage === "home" ? <HomePage /> : null}
    </div>
  );
}

export default App;
