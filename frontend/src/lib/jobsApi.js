import { apiFetch } from "./api";

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function buildQueryString(query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const search = params.toString();
  return search ? `?${search}` : "";
}

export async function fetchJobs(query = {}) {
  const response = await apiFetch(`/api/jobs${buildQueryString(query)}`, {
    method: "GET",
  });
  const data = await readJson(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function fetchJobById(jobId) {
  const response = await apiFetch(`/api/jobs/${jobId}`, {
    method: "GET",
  });
  const data = await readJson(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function fetchJobOptions() {
  const response = await apiFetch("/api/jobs/options", {
    method: "GET",
  });
  const data = await readJson(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
