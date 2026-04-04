import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useDebouncedQueryInput } from "../hooks/useDebouncedQueryInput";
import { usePaginatedResource } from "../hooks/usePaginatedResource";
import { useJobStream } from "../jobs/useJobStream";
import JobListPanel from "../components/JobListPanel";
import {
  createEmployerJob,
  deleteEmployerJob,
  fetchEmployerJobs,
  updateEmployerJob,
} from "../lib/jobsApi";
import { routePaths } from "../routing/routes";
import "../styles/EmployerPage.css";


function EmployerPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingJobId, setEditingJobId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState("");
  const [dashboardStatus, setDashboardStatus] = useState({
    type: "",
    message: "",
  });
  const {
    query,
    result,
    loading,
    error,
    clearError,
    setErrorMessage,
    updateQuery,
    reload,
  } = usePaginatedResource({
    initialQuery: INITIAL_QUERY,
    initialResult: EMPTY_RESULT,
    loadResource: fetchEmployerJobs,
    normalizeResult: normalizeJobsResult,
    fallbackMessage: "Could not load employer jobs.",
  });

  useJobStream(reload);

  const commitSearch = useCallback((search) => {
    updateQuery({ search, page: 1 });
  }, [updateQuery]);

  const {
    inputValue: searchInput,
    setInputValue: setSearchInput,
    isPending: isSearchPending,
  } = useDebouncedQueryInput({
    queryValue: query.search,
    onCommit: commitSearch,
  });

  const isEditingJob = Boolean(editingJobId);
  const isLoadingJobs = loading || isSearchPending;
  const totalPages = result.pagination.totalPages || 0;
  const canGoPrevious = query.page > 1;
  const canGoNext = totalPages > 0 && query.page < totalPages;
  const managedJobs = Array.isArray(result.jobs) ? result.jobs : [];

  function resetForm() {
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setEditingJobId("");
  }

  function clearStatuses() {
    clearError();
    setDashboardStatus({ type: "", message: "" });
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    const normalizedValue = name === "currency" ? value.toUpperCase() : value;

    setFormData((current) => ({
      ...current,
      [name]: normalizedValue,
    }));
    setFieldErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
    clearStatuses();
  }

  function handleEditJob(job) {
    setFormData(createFormState(job));
    setFieldErrors({});
    setEditingJobId(job.id);
    setDashboardStatus({
      type: "success",
      message: `Editing ${job.title}.`,
    });
  }

  function handleCancelEdit() {
    resetForm();
    setDashboardStatus({
      type: "",
      message: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearStatuses();

    const nextFieldErrors = validateJobForm(formData);
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildJobPayload(formData);
      const response = isEditingJob
        ? await updateEmployerJob(editingJobId, payload)
        : await createEmployerJob(payload);

      if (!response.ok) {
        const nextApiFieldErrors = response.error?.fieldErrors || {};
        setFieldErrors(nextApiFieldErrors);
        setDashboardStatus({
          type: "error",
          message: response.error?.message || (
            isEditingJob ? "Could not update job." : "Could not create job."
          ),
        });
        return;
      }

      const savedJob = response.data;
      setDashboardStatus({
        type: "success",
        message: isEditingJob
          ? `${savedJob?.title || "Job"} updated successfully.`
          : `${savedJob?.title || "Job"} created successfully.`,
      });
      resetForm();
      reload();
    } catch {
      setDashboardStatus({
        type: "error",
        message: isEditingJob ? "Could not update job." : "Could not create job.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteJob(job) {
    const shouldDelete = window.confirm(`Delete ${job.title}?`);
    if (!shouldDelete) {
      return;
    }

    clearStatuses();
    setPendingDeleteId(job.id);

    try {
      const response = await deleteEmployerJob(job.id);

      if (!response.ok || !response.data?.deleted) {
        setErrorMessage(response.error?.message || "Could not delete job.");
        return;
      }

      if (editingJobId === job.id) {
        resetForm();
      }

      setDashboardStatus({
        type: "success",
        message: `${job.title} deleted successfully.`,
      });
      reload();
    } catch {
      setErrorMessage("Could not delete job.");
    } finally {
      setPendingDeleteId("");
    }
  }
  const [totalJobs, setTotalJobs] = useState(0);

  return (
    <main className="landing-page">
      <section className="employer-hero" id="employer">
        <div className="employer-hero-copy">
          <p className="hero-eyebrow">Employer Dashboard</p>
          <h1>Manage your hiring presence from one place.</h1>
          <p className="hero-copy">
            Create live job listings, update openings as your hiring needs
            change, and remove filled roles without leaving the dashboard.
          </p>

          <div className="hero-actions">
            <Link className="hero-button hero-button-primary" to={routePaths.jobs}>
              Browse All Jobs
            </Link>
            <Link className="hero-button hero-button-secondary" to={routePaths.employerProfile}>
              View Company Profile
            </Link>
          </div>
        </div>

        <aside className="employer-summary-panel" id="employer-company">
          <p className="employer-summary-label">Hiring Overview</p>
          <h2>{user?.name || "Employer"} listings</h2>
          <p>
            Manage the jobs that currently power the public board. Search and
            edit your listings below without leaving this page.
          </p>
          <div className="employer-summary-stats">
            <div>
              <strong>{totalJobs}</strong>
              <span>jobs in the current scope</span>
            </div>
            <div>
              <strong>Managing</strong>
              <span>live listings</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="employer-management-section" id="employer-jobs">
          <JobListPanel
            loadResource={fetchEmployerJobs}
            fallbackMessage="Could not load employer jobs."
            onCreate={createEmployerJob}
            onUpdate={updateEmployerJob}
            onDelete={deleteEmployerJob}
            canCreate={true}
            onTotalCount={setTotalJobs}
          />
      </section>
    </main>
  );
}

export default EmployerPage;
