import "../styles/JobCard.css";

function formatSalary(value, currency) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value) + (currency ? ` ${currency}` : "");
}

function JobCard({
  title,
  company,
  category,
  jobType,
  country,
  salary,
  currency,
  summary,
}) {
  const eyebrow = company || category || "Job";
  const meta = [jobType, country].filter(Boolean).join(" • ");
  const salaryLabel = typeof salary === "number"
    ? formatSalary(salary, currency)
    : salary;

  return (
    <div className="job-card">
      <p className="job-card-company">{eyebrow}</p>
      <h3>{title}</h3>
      {meta ? <p className="job-card-meta">{meta}</p> : null}
      {salaryLabel ? <p className="job-card-salary">{salaryLabel}</p> : null}
      {summary ? <p className="job-card-summary">{summary}</p> : null}
      <button type="button">View Details</button>
    </div>
  );
}

export default JobCard;
