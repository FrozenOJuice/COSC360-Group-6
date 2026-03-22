import { useEffect, useState } from "react";
import JobCard from "../components/JobCard";
import { fetchJobs } from "../lib/jobsApi";
import "../styles/JobSeekerPage.css";

function JobSeekerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadJobs() {
      try {
        const response = await fetchJobs({
          limit: 6,
          sortBy: "title",
          sortOrder: "asc",
        });

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
      <section className="job-seeker-hero" id="job-seeker">
        <div className="job-seeker-hero-copy">
          <p className="hero-eyebrow">Job Seeker Dashboard</p>
          <h1>Keep your search moving with fresh opportunities.</h1>
          <p className="hero-copy">
            Browse live roles from the public board and keep your profile up to
            date. Saved-job and application totals are intentionally omitted
            until those features are backed by real data.
          </p>

          <div className="hero-actions">
            <a className="hero-button hero-button-primary" href="#jobs">
              Browse All Jobs
            </a>
          </div>
        </div>

        <aside className="job-seeker-profile-preview" id="job-seeker-profile">
          <p className="job-seeker-profile-label">Profile</p>
          <h2>Current seeker tools</h2>
          <p>
            This dashboard keeps the live job board and your profile within
            reach without inventing fake activity counts.
          </p>
          <div className="job-seeker-profile-stats">
            <div>
              <strong>Profile</strong>
              <span>Update your seeker profile and visibility settings.</span>
            </div>
            <div>
              <strong>Live jobs</strong>
              <span>The listings below come directly from the real job board.</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="preview-section" id="job-seeker-jobs">
        <div className="section-heading">
          <p className="section-label">Live Jobs</p>
          <h2>Browse current roles from the job board</h2>
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

export default JobSeekerPage;
