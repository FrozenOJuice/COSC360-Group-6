import { useEffect, useMemo, useRef, useState } from "react";
import JobCard from "../components/JobCard";
import { fetchJobOptions, fetchJobs } from "../lib/jobsApi";
import "../styles/JobsPage.css";

const INITIAL_QUERY = Object.freeze({
  search: "",
  category: "",
  country: "",
  currency: "",
  sortBy: "title",
  sortOrder: "asc",
  page: 1,
  limit: 12,
});

const EMPTY_RESULT = Object.freeze({
  jobs: [],
  pagination: {
    page: 1,
    limit: 12,
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

const EMPTY_OPTIONS = Object.freeze({
  categories: [],
  countries: [],
  currencies: [],
});

function AutocompleteField({
  label,
  value,
  placeholder,
  options,
  onChange,
  onSelect,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const normalizedValue = value.trim().toLowerCase();
    return normalizedValue
      ? options.filter((option) => option.toLowerCase().includes(normalizedValue))
      : options;
  }, [options, value]);

  function handleBlur() {
    window.setTimeout(() => {
      setIsOpen(false);
    }, 100);
  }

  return (
    <label className="jobs-filter-field jobs-autocomplete-field">
      <span>{label}</span>
      <div className="jobs-autocomplete-shell">
        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isOpen && filteredOptions.length > 0 ? (
          <div className="jobs-autocomplete-list" role="listbox" aria-label={`${label} options`}>
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                className="jobs-autocomplete-option"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </label>
  );
}

function JobsPage() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [searchInput, setSearchInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [result, setResult] = useState(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    async function loadOptions() {
      try {
        const response = await fetchJobOptions();

        if (!isActive || !response.ok) {
          return;
        }

        setOptions({
          categories: Array.isArray(response.data.categories) ? response.data.categories : [],
          countries: Array.isArray(response.data.countries) ? response.data.countries : [],
          currencies: Array.isArray(response.data.currencies) ? response.data.currencies : [],
        });
      } catch {
        // Keep filters usable even if the option lookup fails.
      }
    }

    void loadOptions();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchInput.trim();

      setQuery((current) => {
        if (current.search === nextSearch) {
          return current;
        }

        return {
          ...current,
          search: nextSearch,
          page: 1,
        };
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    let isActive = true;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);

    async function loadJobs() {
      try {
        const response = await fetchJobs(query);

        if (!isActive || requestIdRef.current !== requestId) {
          return;
        }

        if (!response.ok) {
          setError(response.data.message || "Could not load jobs.");
          setLoading(false);
          return;
        }

        const nextJobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
        const nextPagination = response.data.pagination ?? EMPTY_RESULT.pagination;

        if (nextPagination.totalPages > 0 && query.page > nextPagination.totalPages) {
          setQuery((current) => (
            current.page === query.page
              ? { ...current, page: nextPagination.totalPages }
              : current
          ));
          return;
        }

        setResult({
          jobs: nextJobs,
          pagination: nextPagination,
          sort: response.data.sort ?? EMPTY_RESULT.sort,
          filters: response.data.filters ?? EMPTY_RESULT.filters,
        });
        setError("");
        setLoading(false);
      } catch {
        if (!isActive || requestIdRef.current !== requestId) {
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
  }, [query]);

  function updateQuery(patch) {
    setQuery((current) => ({
      ...current,
      ...patch,
    }));
  }

  function clearFilters() {
    setSearchInput("");
    setCategoryInput("");
    setCountryInput("");
    setCurrencyInput("");
    setQuery(INITIAL_QUERY);
  }

  const totalPages = result.pagination.totalPages || 0;
  const canGoPrevious = query.page > 1;
  const canGoNext = totalPages > 0 && query.page < totalPages;

  return (
    <main className="landing-page">
      <section className="jobs-page-hero">
        <div className="jobs-page-copy">
          <p className="hero-eyebrow">Public Jobs</p>
          <h1>Browse live openings across the board.</h1>
          <p className="hero-copy">
            Search by title, narrow the list by category, country, or currency,
            and sort openings the way you want to review them.
          </p>
        </div>

        <aside className="jobs-page-summary">
          <p className="jobs-page-summary-label">Current Results</p>
          <strong>{result.pagination.total}</strong>
          <span>jobs in the current search scope</span>
        </aside>
      </section>

      <section className="jobs-toolbar-section">
        <div className="jobs-toolbar">
          <label className="jobs-filter-field jobs-filter-search">
            <span>Search</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search title, category, or country"
            />
          </label>

          <AutocompleteField
            label="Category"
            value={categoryInput}
            placeholder="Type to match categories"
            options={options.categories}
            onChange={setCategoryInput}
            onSelect={(value) => {
              setCategoryInput(value);
              updateQuery({ category: value, page: 1 });
            }}
          />

          <AutocompleteField
            label="Country"
            value={countryInput}
            placeholder="Type to match countries"
            options={options.countries}
            onChange={setCountryInput}
            onSelect={(value) => {
              setCountryInput(value);
              updateQuery({ country: value, page: 1 });
            }}
          />

          <AutocompleteField
            label="Currency"
            value={currencyInput}
            placeholder="Type to match currencies"
            options={options.currencies}
            onChange={(value) => setCurrencyInput(value.toUpperCase())}
            onSelect={(value) => {
              setCurrencyInput(value);
              updateQuery({ currency: value, page: 1 });
            }}
          />

          <label className="jobs-filter-field">
            <span>Sort by</span>
            <select
              value={query.sortBy}
              onChange={(event) => updateQuery({ sortBy: event.target.value, page: 1 })}
            >
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="country">Country</option>
              <option value="salary">Salary</option>
              <option value="currency">Currency</option>
              <option value="exchangeRate">Exchange rate</option>
            </select>
          </label>

          <label className="jobs-filter-field">
            <span>Order</span>
            <select
              value={query.sortOrder}
              onChange={(event) => updateQuery({ sortOrder: event.target.value, page: 1 })}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>

          <label className="jobs-filter-field">
            <span>Per page</span>
            <select
              value={query.limit}
              onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </label>

          <button type="button" className="jobs-clear-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </section>

      {error ? <div className="jobs-status jobs-status-error">{error}</div> : null}

      <section className="preview-section">
        <div className="section-heading jobs-results-heading">
          <div>
            <p className="section-label">Job Listings</p>
            <h2>Browse current openings</h2>
          </div>
          <p className="jobs-results-summary">
            Page {result.pagination.page} of {Math.max(totalPages, 1)}
          </p>
        </div>

        {loading ? (
          <p className="page-status">Loading jobs...</p>
        ) : result.jobs.length === 0 ? (
          <p className="page-status">No jobs matched the current search.</p>
        ) : (
          <div className="job-grid">
            {result.jobs.map((job) => (
              <JobCard
                key={job.id}
                title={job.title}
                category={job.category}
                country={job.country}
                salary={job.salary}
                currency={job.currency}
              />
            ))}
          </div>
        )}
      </section>

      <div className="jobs-pagination">
        <button
          type="button"
          onClick={() => updateQuery({ page: query.page - 1 })}
          disabled={!canGoPrevious || loading}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => updateQuery({ page: query.page + 1 })}
          disabled={!canGoNext || loading}
        >
          Next
        </button>
      </div>
    </main>
  );
}

export default JobsPage;
