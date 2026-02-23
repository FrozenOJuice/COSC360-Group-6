import "../styles/JobCard.css";

function JobCard({ title, company, jobType, salary }) {
  return (
    <div className="job-card">
      <h3>{title}</h3>
      <p>{company} - {jobType}</p>
      <p>{salary}</p>
      <button>View More Details</button>
    </div>
  );
}

export default JobCard;
