import JobCard from "../components/JobCard";
import "../styles/EmployerPage.css";

const previewJobs = [
  {
    title: "Senior Account Executive",
    company: "Your Company",
    jobType: "Full-time",
    salary: "$88,000 - $110,000",
    summary: "A sample listing showing how employer jobs can appear to candidates.",
  },
  {
    title: "Operations Coordinator",
    company: "Your Company",
    jobType: "Hybrid",
    salary: "$56,000 - $69,000",
    summary: "Keep hiring operations organized across scheduling, outreach, and onboarding.",
  },
  {
    title: "Marketing Manager",
    company: "Your Company",
    jobType: "Remote",
    salary: "$72,000 - $92,000",
    summary: "Lead campaigns and shape the brand story for a growing team.",
  },
];

function EmployerPage() {
  return (
    <main className="landing-page">
      <section className="employer-hero" id="employer">
        <div className="employer-hero-copy">
          <p className="hero-eyebrow">Employer Dashboard</p>
          <h1>Manage your hiring presence from one place.</h1>
          <p className="hero-copy">
            Review active listings, keep your company profile visible, and stay
            ready to connect with qualified candidates.
          </p>

          <div className="hero-actions">
            <a className="hero-button hero-button-primary" href="#jobs">
              Browse All Jobs
            </a>
          </div>
        </div>

        <aside className="employer-summary-panel" id="employer-company">
          <p className="employer-summary-label">Company Profile</p>
          <h2>Hiring snapshot</h2>
          <p>
            Keep your profile polished and your listings visible to the right
            candidates.
          </p>
          <div className="employer-summary-stats">
            <div>
              <strong>3</strong>
              <span>active listings</span>
            </div>
            <div>
              <strong>19</strong>
              <span>new applicants</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="preview-section" id="employer-jobs">
        <div className="section-heading">
          <p className="section-label">Active Listings</p>
          <h2>Preview jobs from your company</h2>
        </div>

        <div className="job-grid">
          {previewJobs.map((job) => (
            <JobCard key={`${job.company}-${job.title}`} {...job} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default EmployerPage;
