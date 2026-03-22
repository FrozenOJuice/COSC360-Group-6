import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import { fetchJobs } from "../lib/jobsApi";
import { routePaths } from "../routing/routes";
import "../styles/App.css";

function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadJobs() {
      try {
        const response = await fetchJobs({ limit: 6 });

        if (!isActive) {
          return;
        }

        if (!response.ok) {
          setError(response.data.message || "Could not load jobs.");
          setLoading(false);
          return;
        }

        setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
        setError("");
        setLoading(false);
      } catch {
        if (!isActive) {
          return;
        }

        setError("Could not connect to the server.");
        setLoading(false);
      }
    }

    void loadJobs();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="landing-page">
      <section className="hero-section" id="top">
        <p className="hero-eyebrow">Job Board</p>
        <h1>Find your next opportunity in one place.</h1>
        <p className="hero-copy">
          Browse current openings, preview featured roles, and create an account
          when you are ready to apply.
        </p>

        <div className="hero-actions">
          <Link className="hero-button hero-button-primary" to={routePaths.jobs}>
            Browse All Jobs
          </Link>
          <Link className="hero-button hero-button-secondary" to={routePaths.register}>
            Create An Account
          </Link>
        </div>
      </section>

      <section className="preview-section" id="jobs">
        <div className="section-heading">
          <p className="section-label">Featured Jobs</p>
          <h2>Preview current opportunities</h2>
        </div>

        {loading ? <p className="page-status">Loading jobs...</p> : null}
        {error ? <p className="page-status">{error}</p> : null}
        {!loading && !error ? (
          jobs.length > 0 ? (
            <div className="job-grid">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  jobId={job.id}
                  title={job.title}
                  category={job.category}
                  country={job.country}
                  salary={job.salary}
                  currency={job.currency}
                />
              ))}
            </div>
          ) : (
            <p className="page-status">No jobs available right now.</p>
          )
        ) : null}
      </section>
    </main>
  );
}

export default HomePage;
