import { useCallback, useEffect, useState } from "react";
import { useDebouncedQueryInput } from "../hooks/useDebouncedQueryInput";
import { usePaginatedResource } from "../hooks/usePaginatedResource";
import "../styles/EmployerPage.css";

const INITIAL_QUERY = Object.freeze({
  search: "",
  sortBy: "title",
  sortOrder: "asc",
  page: 1,
  limit: 6,
});

const EMPTY_RESULT = Object.freeze({
  jobs: [],
  pagination: {
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  },
  sort: {
    by: "title",
    order: "asc",
  },
  filters: {
    search: "",
    category: "",
    country: "",
    currency: "",
  },
});

const INITIAL_FORM = Object.freeze({
  title: "",
  category: "",
  country: "",
  salary: "",
  currency: "",
});

function normalizeJobsResult(data) {
  return {
    jobs: Array.isArray(data?.jobs) ? data.jobs : [],
    pagination: data?.pagination ?? EMPTY_RESULT.pagination,
    sort: data?.sort ?? EMPTY_RESULT.sort,
    filters: data?.filters ?? EMPTY_RESULT.filters,
  };
}

function createFormState(job = null) {
  return {
    title: job?.title || "",
    category: job?.category || "",
    country: job?.country || "",
    salary:
      job?.salary !== undefined && job?.salary !== null ? String(job.salary) : "",
    currency: job?.currency || "",
  };
}

function validateJobForm(formData) {
  const nextFieldErrors = {};

  if (!formData.title.trim()) {
    nextFieldErrors.title = "Title is required.";
  }
  if (!formData.category.trim()) {
    nextFieldErrors.category = "Category is required.";
  }
  if (!formData.country.trim()) {
    nextFieldErrors.country = "Country is required.";
  }
  if (!formData.currency.trim()) {
    nextFieldErrors.currency = "Currency is required.";
  }

  const salary = Number.parseFloat(formData.salary);
  if (formData.salary.trim() === "") {
    nextFieldErrors.salary = "Salary is required.";
  } else if (Number.isNaN(salary) || salary < 0) {
    nextFieldErrors.salary = "Salary must be a number greater than or equal to 0.";
  }

  return nextFieldErrors;
}

function buildJobPayload(formData) {
  return {
    title: formData.title.trim(),
    category: formData.category.trim(),
    country: formData.country.trim(),
    salary: Number.parseFloat(formData.salary),
    currency: formData.currency.trim().toUpperCase(),
  };
}

function getFieldClass(fieldErrors, fieldName) {
  return fieldErrors[fieldName]
    ? "employer-job-input employer-job-input-error"
    : "employer-job-input";
}

function formatSalary(value, currency) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Salary unavailable";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}${currency ? ` ${currency}` : ""}`;
}

function formatTimestamp(value) {
  if (!value) {
    return "Recently updated";
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

function ListingCard({ job, isEditing, isDeleting, onEdit, onDelete }) {
  return (
    <article className="employer-job-card">
      <div className="employer-job-card-header">
        <div>
          <p className="employer-job-card-label">{job.category || "Job"}</p>
          <h3>{job.title}</h3>
        </div>
        <span className="employer-job-card-country">{job.country}</span>
      </div>

      <div className="employer-job-card-metrics">
        <div>
          <span>Salary</span>
          <strong>{formatSalary(job.salary, job.currency)}</strong>
        </div>
        <div>
          <span>Updated</span>
          <strong>{formatTimestamp(job.updatedAt)}</strong>
        </div>
      </div>

      <div className="employer-job-card-actions">
        <button
          type="button"
          className="employer-job-action employer-job-action-primary"
          onClick={() => onEdit(job)}
          disabled={isDeleting}
        >
          {isEditing ? "Editing" : "Edit"}
        </button>
        <button
          type="button"
          className="employer-job-action employer-job-action-muted"
          onClick={() => onDelete(job)}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

function JobListPanel({
  loadResource,
  fallbackMessage = "Could not load jobs.",
  onCreate,
  onUpdate,
  onDelete,
  canCreate = true,
  onTotalCount,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingJobId, setEditingJobId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState("");
  const [dashboardStatus, setDashboardStatus] = useState({ type: "", message: "" });
  const [error, setError] = useState("");

  const {
    query,
    result,
    loading,
    error: resourceError,
    clearError,
    updateQuery,
    reload,
  } = usePaginatedResource({
    initialQuery: INITIAL_QUERY,
    initialResult: EMPTY_RESULT,
    loadResource,
    normalizeResult: normalizeJobsResult,
    fallbackMessage,
  });

  useEffect(() => {
    if (typeof onTotalCount === "function") {
      onTotalCount(result.pagination.total);
    }
  }, [onTotalCount, result.pagination.total]);

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

  const isLoadingJobs = loading || isSearchPending;
  const totalPages = result.pagination.totalPages || 0;
  const canGoPrevious = query.page > 1;
  const canGoNext = totalPages > 0 && query.page < totalPages;
  const managedJobs = Array.isArray(result.jobs) ? result.jobs : [];

  const clearStatuses = () => {
    clearError();
    setError("");
    setDashboardStatus({ type: "", message: "" });
  };

  const startEdit = (job) => {
    clearStatuses();
    setFormData(createFormState(job));
    setFieldErrors({});
    setEditingJobId(job.id);
    setDashboardStatus({ type: "success", message: `Editing ${job.title}.` });
  };

  const cancelEdit = () => {
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setEditingJobId("");
    setDashboardStatus({ type: "", message: "" });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const normalizedValue = name === "currency" ? value.toUpperCase() : value;

    setFormData((current) => ({ ...current, [name]: normalizedValue }));
    setFieldErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
    setDashboardStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearStatuses();

    if (!canCreate && !editingJobId) {
      return;
    }

    const nextFieldErrors = validateJobForm(formData);
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildJobPayload(formData);
      const response = editingJobId
        ? (onUpdate ? await onUpdate(editingJobId, payload) : { ok: false, error: new Error('Update is unavailable') })
        : (onCreate ? await onCreate(payload) : { ok: false, error: new Error('Create is unavailable') });

      if (!response.ok) {
        const nextApiFieldErrors = response.error?.fieldErrors || {};
        setFieldErrors(nextApiFieldErrors);
        setDashboardStatus({ type: "error", message: response.error?.message || "Could not save job." });
        return;
      }

      const savedJob = response.data;
      setDashboardStatus({
        type: "success",
        message: editingJobId
          ? `${savedJob?.title || "Job"} updated successfully.`
          : `${savedJob?.title || "Job"} created successfully.`,
      });
      setFormData(INITIAL_FORM);
      setFieldErrors({});
      setEditingJobId("");
      reload();
    } catch {
      setDashboardStatus({
        type: "error",
        message: editingJobId ? "Could not update job." : "Could not create job.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (job) => {
    const shouldDelete = window.confirm(`Delete ${job.title}?`);
    if (!shouldDelete) {
      return;
    }

    clearStatuses();
    setPendingDeleteId(job.id);

    try {
      const response = await onDelete(job.id);

      if (!response.ok) {
        setDashboardStatus({ type: "error", message: response.error?.message || "Could not delete job." });
        return;
      }

      if (editingJobId === job.id) {
        cancelEdit();
      }

      setDashboardStatus({ type: "success", message: `${job.title} deleted successfully.` });
      reload();
    } catch {
      setDashboardStatus({ type: "error", message: "Could not delete job." });
    } finally {
      setPendingDeleteId("");
    }
  };

  const showEditor = canCreate || editingJobId;

  return (
    <div className={`employer-management-grid${showEditor ? "" : " employer-management-grid-single"}`}>
      {showEditor && (
        <form className="employer-job-editor" onSubmit={handleSubmit}>
          <div className="employer-job-editor-header">
            <div>
              <p className="section-label">Listing Editor</p>
              <h2>{editingJobId ? "Update listing" : "Create a new listing"}</h2>
            </div>
            {editingJobId && (
              <button
                type="button"
                className="employer-job-secondary-button"
                onClick={cancelEdit}
                disabled={isSubmitting}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {dashboardStatus.message && (
            <div className={`employer-job-status employer-job-status-${dashboardStatus.type}`}>
              {dashboardStatus.message}
            </div>
          )}

          <div className="employer-job-form-grid">
            <label className="employer-job-field employer-job-field-wide">
              <span>Title</span>
              <input
                className={getFieldClass(fieldErrors, "title")}
                name="title"
                type="text"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Senior Frontend Engineer"
              />
              {fieldErrors.title && <p className="employer-job-field-error">{fieldErrors.title}</p>}
            </label>

            <label className="employer-job-field">
              <span>Category</span>
              <input
                className={getFieldClass(fieldErrors, "category")}
                name="category"
                type="text"
                value={formData.category}
                onChange={handleFormChange}
                placeholder="Engineering"
              />
              {fieldErrors.category && <p className="employer-job-field-error">{fieldErrors.category}</p>}
            </label>

            <label className="employer-job-field">
              <span>Country</span>
              <input
                className={getFieldClass(fieldErrors, "country")}
                name="country"
                type="text"
                value={formData.country}
                onChange={handleFormChange}
                placeholder="Canada"
              />
              {fieldErrors.country && <p className="employer-job-field-error">{fieldErrors.country}</p>}
            </label>

            <label className="employer-job-field">
              <span>Salary</span>
              <input
                className={getFieldClass(fieldErrors, "salary")}
                name="salary"
                type="number"
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={handleFormChange}
                placeholder="85000"
              />
              {fieldErrors.salary && <p className="employer-job-field-error">{fieldErrors.salary}</p>}
            </label>

            <label className="employer-job-field">
              <span>Currency</span>
              <input
                className={getFieldClass(fieldErrors, "currency")}
                name="currency"
                type="text"
                value={formData.currency}
                onChange={handleFormChange}
                placeholder="USD"
                maxLength={10}
              />
              {fieldErrors.currency && <p className="employer-job-field-error">{fieldErrors.currency}</p>}
            </label>
          </div>

          <div className="employer-job-editor-actions">
            <button
              type="submit"
              className="hero-button hero-button-primary employer-job-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? editingJobId
                  ? "Saving..."
                  : "Creating..."
                : editingJobId
                ? "Save Changes"
                : "Create Job"}
            </button>
          </div>
        </form>
      )}

      <div className="employer-job-list-shell">
        <div className="employer-job-list-header">
          <div>
            <p className="section-label">Managed Listings</p>
            <h2>Review and maintain live openings</h2>
          </div>
          <p className="employer-job-list-summary">
            Page {result.pagination.page} of {Math.max(totalPages, 1)}
          </p>
        </div>

        <div className="employer-job-toolbar">
          <label className="employer-job-toolbar-field employer-job-toolbar-search">
            <span>Search</span>
            <input
              className="employer-job-input"
              type="search"
              value={searchInput}
              onChange={(event) => {
                clearStatuses();
                setSearchInput(event.target.value);
              }}
              placeholder="Search titles, categories, or countries"
            />
          </label>

          <label className="employer-job-toolbar-field">
            <span>Sort by</span>
            <select
              className="employer-job-input"
              value={query.sortBy}
              onChange={(event) => updateQuery({ sortBy: event.target.value, page: 1 })}
            >
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="country">Country</option>
              <option value="salary">Salary</option>
              <option value="currency">Currency</option>
            </select>
          </label>

          <label className="employer-job-toolbar-field">
            <span>Order</span>
            <select
              className="employer-job-input"
              value={query.sortOrder}
              onChange={(event) => updateQuery({ sortOrder: event.target.value, page: 1 })}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>

          <label className="employer-job-toolbar-field">
            <span>Per page</span>
            <select
              className="employer-job-input"
              value={query.limit}
              onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </label>
        </div>

        {(resourceError || error) && (
          <div className='employer-job-status employer-job-status-error'>
            {resourceError || error}
          </div>
        )}

        {isLoadingJobs ? (
          <p className='page-status employer-page-status'>Loading listings...</p>
        ) : managedJobs.length === 0 ? (
          <p className='page-status employer-page-status'>
            No listings matched the current view. Try adjusting your filters or search.
          </p>
        ) : (
          <div className='employer-job-list'>
            {managedJobs.map((job) => (
              <ListingCard
                key={job.id}
                job={job}
                isEditing={editingJobId === job.id}
                isDeleting={pendingDeleteId === job.id}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className='employer-job-pagination'>
          <button
            type='button'
            className='employer-job-secondary-button'
            onClick={() => updateQuery({ page: query.page - 1 })}
            disabled={!canGoPrevious || isLoadingJobs}
          >
            Previous
          </button>
          <button
            type='button'
            className='employer-job-secondary-button'
            onClick={() => updateQuery({ page: query.page + 1 })}
            disabled={!canGoNext || isLoadingJobs}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobListPanel;
