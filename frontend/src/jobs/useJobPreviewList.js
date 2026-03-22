import { useEffect, useState } from "react";
import { fetchJobs } from "../lib/jobsApi";

export function useJobPreviewList(
  query,
  { fallbackMessage = "Could not load jobs." } = {}
) {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [resolvedQuery, setResolvedQuery] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadJobs() {
      try {
        const response = await fetchJobs(query);

        if (!isActive) {
          return;
        }

        if (!response.ok) {
          setJobs([]);
          setError(response.data.message || fallbackMessage);
          setResolvedQuery(query);
          return;
        }

        setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
        setError("");
        setResolvedQuery(query);
      } catch {
        if (!isActive) {
          return;
        }

        setJobs([]);
        setError("Could not connect to the server.");
        setResolvedQuery(query);
      }
    }

    void loadJobs();

    return () => {
      isActive = false;
    };
  }, [fallbackMessage, query]);

  const loading = resolvedQuery !== query;

  return {
    jobs,
    loading,
    error,
  };
}
