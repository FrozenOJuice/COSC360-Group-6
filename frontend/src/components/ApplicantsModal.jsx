import { useEffect, useState } from "react";
import { fetchJobApplicants } from "../lib/jobsApi";

function ApplicantRow({ applicant }) {
  const [open, setOpen] = useState(false);

  const formattedDate = applicant.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(applicant.createdAt))
    : "—";

  return (
    <li className="applicant-row">
      <button
        type="button"
        className="applicant-row-toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="applicant-row-name">{applicant.name}</span>
        <span className="applicant-row-chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <dl className="applicant-row-details">
          <div>
            <dt>Email</dt>
            <dd>{applicant.email || "—"}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{applicant.role || "—"}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{formattedDate}</dd>
          </div>
        </dl>
      )}
    </li>
  );
}

function ApplicantsModal({ job, onClose }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        setLoading(true);
        const response = await fetchJobApplicants(job.id);
        if (!isActive) return;
        if (!response.ok) {
          setError(response.error?.message || "Could not load applicants.");
          setLoading(false);
          return;
        }
        setApplicants(response.data ?? []);
        setError("");
      } catch {
        if (isActive) setError("Could not connect to the server.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void load();
    return () => {
      isActive = false;
    };
  }, [job.id]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="applicants-backdrop" onClick={handleBackdropClick}>
      <div className="applicants-modal" role="dialog" aria-modal="true">
        <div className="applicants-modal-header">
          <div>
            <p className="section-label">Applicants</p>
            <h2>{job.title}</h2>
          </div>
          <button
            type="button"
            className="applicants-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="applicants-modal-body">
          {loading && <p className="page-status">Loading applicants...</p>}
          {!loading && error && <p className="page-status">{error}</p>}
          {!loading && !error && applicants.length === 0 && (
            <p className="page-status">No applicants yet for this listing.</p>
          )}
          {!loading && !error && applicants.length > 0 && (
            <ul className="applicants-list">
              {applicants.map((applicant) => (
                <ApplicantRow key={applicant.id} applicant={applicant} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicantsModal;