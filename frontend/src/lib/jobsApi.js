import { buildQueryString, mapResultData, requestJson } from "./api";

export async function fetchJobs(query = {}) {
  return requestJson(`/api/jobs${buildQueryString(query)}`, {
    method: "GET",
  }, {
    fallbackMessage: "Could not load jobs.",
  });
}

export async function fetchJobById(jobId) {
  const result = await requestJson(`/api/jobs/${jobId}`, {
    method: "GET",
  }, {
    fallbackMessage: "Could not load this job.",
  });

  return mapResultData(result, (data) => data?.job ?? null);
}

export async function fetchJobOptions() {
  return requestJson("/api/jobs/options", {
    method: "GET",
  }, {
    fallbackMessage: "Could not load job filter options.",
  });
}
