import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";
import AdminPage from "./pages/AdminPage";
import Navbar from "./components/Navbar";
import EmployerPage from "./pages/EmployerPage";
import HomePage from "./pages/HomePage";
import JobSeekerPage from "./pages/JobSeekerPage";
import JobSeekerProfilePage from "./pages/JobSeekerProfilePage";
import JobsPage from "./pages/JobsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import {
  getCurrentPage,
  getLandingHash,
  getRequiredRoleForPage,
} from "./lib/authRoutes";
import "./styles/App.css";

function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const { loading: authLoading, user: authUser } = useAuth();

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const currentPage = getCurrentPage(hash);
  const requiredRole = getRequiredRoleForPage(currentPage);
  const navbarVariant = requiredRole === "admin" && authUser?.role === "admin"
    ? "admin"
    : requiredRole === "seeker" && authUser?.role === "seeker"
      ? "jobSeeker"
      : requiredRole === "employer" && authUser?.role === "employer"
        ? "employer"
        : "public";

  useEffect(() => {
    if (authLoading) return;

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
  }, [authLoading, authUser, currentPage, requiredRole]);

  const shouldShowProtectedPage =
    !authLoading && authUser && (!requiredRole || authUser.role === requiredRole);

  return (
    <div className="app-shell">
      <Navbar variant={navbarVariant} />
      {authLoading && requiredRole ? (
        <main className="page-status">Checking session...</main>
      ) : null}
      {currentPage === "admin" && shouldShowProtectedPage ? <AdminPage /> : null}
      {currentPage === "employer" && shouldShowProtectedPage ? <EmployerPage /> : null}
      {currentPage === "jobs" ? <JobsPage /> : null}
      {currentPage === "jobSeeker" && shouldShowProtectedPage ? <JobSeekerPage /> : null}
      {currentPage === "jobSeekerProfile" && shouldShowProtectedPage ? <JobSeekerProfilePage /> : null}
      {currentPage === "login" ? <LoginPage /> : null}
      {currentPage === "register" ? <RegisterPage /> : null}
      {currentPage === "home" ? <HomePage /> : null}
    </div>
  );
}

export default App;
