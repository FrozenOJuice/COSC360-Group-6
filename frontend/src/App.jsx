import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import EmployerPage from "./pages/EmployerPage";
import HomePage from "./pages/HomePage";
import JobSeekerPage from "./pages/JobSeekerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./styles/App.css";

function getCurrentPage(hash) {
  if (hash === "#login") return "login";
  if (hash.startsWith("#employer")) return "employer";
  if (hash.startsWith("#job-seeker")) return "jobSeeker";
  return hash === "#register" ? "register" : "home";
}

function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const currentPage = getCurrentPage(hash);
  const navbarVariant = currentPage === "jobSeeker"
    ? "jobSeeker"
    : currentPage === "employer"
      ? "employer"
      : "public";

  return (
    <div className="app-shell">
      <Navbar variant={navbarVariant} />
      {currentPage === "employer" ? <EmployerPage /> : null}
      {currentPage === "jobSeeker" ? <JobSeekerPage /> : null}
      {currentPage === "login" ? <LoginPage /> : null}
      {currentPage === "register" ? <RegisterPage /> : null}
      {currentPage === "home" ? <HomePage /> : null}
    </div>
  );
}

export default App;
