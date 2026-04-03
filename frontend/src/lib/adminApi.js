import { buildQueryString, mapResultData, requestJson } from "./api";

export async function fetchAdminUsers(query = {}) {
  return requestJson(`/api/admin/users${buildQueryString(query)}`, {
    method: "GET",
  }, {
    fallbackMessage: "Could not load users.",
  });
}

export async function fetchAdminUserById(userId) {
  const result = await requestJson(`/api/admin/users/${userId}`, {
    method: "GET",
  }, {
    fallbackMessage: "Could not load user.",
  });

  return mapResultData(result, (data) => data?.user ?? null);
}

export async function updateAdminUserStatus(userId, status) {
  const result = await requestJson(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  }, {
    fallbackMessage: "Could not update user status.",
  });

  return mapResultData(result, (data) => data?.user ?? null);
}

export async function updateAdminJob(jobId, jobData) {
  const result = await requestJson(`/api/admin/jobs/${jobId}`, {
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

export async function deleteAdminJob(jobId) {
  const result = await requestJson(`/api/admin/jobs/${jobId}`, {
    method: "DELETE",
  }, {
    fallbackMessage: "Could not delete job.",
  });

  return mapResultData(result, (data) => data?.job ?? null);
}
