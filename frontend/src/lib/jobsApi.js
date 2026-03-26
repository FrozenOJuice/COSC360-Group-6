import { buildQueryString, mapResultData, requestJson } from "./api";

export async function fetchJobs(query = {}) {
  return requestJson(`/api/jobs${buildQueryString(query)}`, {
    method: "GET",
  }, {
    fallbackMessage: "Could not load jobs.",
  });
}

export async function fetchEmployerJobs(query = {}) {
  return requestJson(`/api/jobs/me${buildQueryString(query)}`, {
    method: "GET",
  }, {
    fallbackMessage: "Could not load employer jobs.",
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

export async function fetchJobDiscussion(jobId) {
  const result = await requestJson(`/api/jobs/${jobId}/discussion`, {
    method: "GET",
  }, {
    fallbackMessage: "Could not load job discussion.",
  });

  return mapResultData(result, (data) => data?.discussion ?? { jobId, comments: [] });
}

export async function postJobDiscussionComment(jobId, comment) {
  const result = await requestJson(`/api/jobs/${jobId}/discussion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  }, {
    fallbackMessage: "Could not post comment.",
  });

  return mapResultData(result, (data) => data?.discussion ?? { jobId, comments: [] });
}

export async function updateJobDiscussionComment(jobId, commentId, comment) {
  const result = await requestJson(`/api/jobs/${jobId}/discussion/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  }, {
    fallbackMessage: "Could not update comment.",
  });

  return mapResultData(result, (data) => data?.discussion ?? { jobId, comments: [] });
}

export async function deleteJobDiscussionComment(jobId, commentId) {
  const result = await requestJson(`/api/jobs/${jobId}/discussion/${commentId}`, {
    method: "DELETE",
  }, {
    fallbackMessage: "Could not delete comment.",
  });

  return mapResultData(result, (data) => data?.discussion ?? { jobId, comments: [] });
}

export async function fetchJobOptions() {
  return requestJson("/api/jobs/options", {
    method: "GET",
  }, {
    fallbackMessage: "Could not load job filter options.",
  });
}

export async function createEmployerJob(jobData) {
  const result = await requestJson("/api/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
  }, {
    fallbackMessage: "Could not create job.",
  });

  return mapResultData(result, (data) => data?.job ?? null);
}

export async function updateEmployerJob(jobId, jobData) {
  const result = await requestJson(`/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
  }, {
    fallbackMessage: "Could not update job.",
  });

  return mapResultData(result, (data) => data?.job ?? null);
}

export async function deleteEmployerJob(jobId) {
  const result = await requestJson(`/api/jobs/${jobId}`, {
    method: "DELETE",
  }, {
    fallbackMessage: "Could not delete job.",
  });

  return mapResultData(result, (data) => ({
    deleted: Boolean(data?.deleted),
    job: data?.job ?? null,
  }));
}
