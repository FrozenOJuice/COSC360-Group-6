import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchJobById } from "../lib/jobsApi";
import { routePaths } from "../routing/routes";
import "../styles/JobDetailsPage.css";

function formatSalary(value, currency) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Salary unavailable";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}${currency ? ` ${currency}` : ""}`;
}

function formatExchangeRate(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(value);
}

function JobDetailsPage({ jobId: jobIdProp }) {
  const params = useParams();
  const jobId = jobIdProp ?? params.jobId;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadJob() {
      try {
        const response = await fetchJobById(jobId);

        if (!isActive) {
          return;
        }

        if (!response.ok) {
          setError(response.data.message || "Could not load this job.");
          setLoading(false);
          return;
        }

        setJob(response.data ?? null);
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

    void loadJob();

    return () => {
      isActive = false;
    };
  }, [jobId]);

  const salaryLabel = formatSalary(job?.salary, job?.currency);
  const exchangeRateLabel = formatExchangeRate(job?.exchangeRate);
  const subtitle = [job?.category, job?.country].filter(Boolean).join(" • ");

  return (
    <main className="landing-page">
      <section className="job-details-page">
        <Link className="job-details-back" to={routePaths.jobs}>
          Back to jobs
        </Link>

        {loading ? <p className="page-status">Loading job...</p> : null}
        {!loading && error ? <p className="page-status">{error}</p> : null}
        {!loading && !error && job ? (
          <article className="job-details-card">
            <p className="hero-eyebrow">Job Details</p>
            <h1>{job.title}</h1>
            {subtitle ? <p className="job-details-subtitle">{subtitle}</p> : null}

            <dl className="job-details-fields">
              <div>
                <dt>Salary</dt>
                <dd>{salaryLabel}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{job.category || "Unavailable"}</dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>{job.country || "Unavailable"}</dd>
              </div>
              <div>
                <dt>Currency</dt>
                <dd>{job.currency || "Unavailable"}</dd>
              </div>
              <div>
                <dt>Exchange Rate</dt>
                <dd>{exchangeRateLabel}</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </section>
    </main>
  );
}

export default JobDetailsPage;
