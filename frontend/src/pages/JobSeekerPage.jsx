import JobCard from "../components/JobCard";
import "../styles/JobSeekerPage.css";

const previewJobs = [
  {
    title: "Product Designer",
    company: "Beacon Studio",
    jobType: "Remote",
    salary: "$74,000 - $90,000",
    summary: "Work across product and marketing to shape a user-friendly hiring experience.",
  },
  {
    title: "Frontend Engineer",
    company: "Riverbyte",
    jobType: "Hybrid",
    salary: "$82,000 - $101,000",
    summary: "Build responsive interfaces for application, search, and profile workflows.",
  },
  {
    title: "Customer Success Specialist",
    company: "Northwind Careers",
    jobType: "Full-time",
    salary: "$58,000 - $68,000",
    summary: "Help employers and job seekers navigate the platform and hiring process.",
  },
];

function JobSeekerPage() {
  return (
    <main className="landing-page">
      <section className="job-seeker-hero" id="job-seeker">
        <div className="job-seeker-hero-copy">
          <p className="hero-eyebrow">Job Seeker Dashboard</p>
          <h1>Keep your search moving with fresh opportunities.</h1>
          <p className="hero-copy">
            Browse new roles, jump back into your search, and keep your account
            ready for the next application.
          </p>

          <div className="hero-actions">
            <a className="hero-button hero-button-primary" href="#job-seeker-jobs">
              Browse All Jobs
            </a>
          </div>
        </div>

        <aside className="job-seeker-profile-preview" id="job-seeker-profile">
          <p className="job-seeker-profile-label">Profile</p>
          <h2>Welcome back</h2>
          <p>
            Your profile is ready to support quick applications and saved job
            searches.
          </p>
          <div className="job-seeker-profile-stats">
            <div>
              <strong>12</strong>
              <span>saved jobs</span>
            </div>
            <div>
              <strong>4</strong>
              <span>applications</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="preview-section" id="job-seeker-jobs">
        <div className="section-heading">
          <p className="section-label">Recommended Jobs</p>
          <h2>Preview roles worth a closer look</h2>
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

export default JobSeekerPage;
