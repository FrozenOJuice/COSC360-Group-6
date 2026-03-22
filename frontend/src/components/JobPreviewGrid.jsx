import JobCard from "./JobCard";

function JobPreviewGrid({
  jobs = [],
  loading,
  error,
  loadingMessage = "Loading jobs...",
  emptyMessage = "No jobs available right now.",
}) {
  if (loading) {
    return <p className="page-status">{loadingMessage}</p>;
  }

  if (error) {
    return <p className="page-status">{error}</p>;
  }

  if (jobs.length === 0) {
    return <p className="page-status">{emptyMessage}</p>;
  }

  return (
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
  );
}

export default JobPreviewGrid;
