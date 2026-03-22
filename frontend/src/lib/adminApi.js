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

export async function fetchAdminUsers(query = {}) {
  const response = await apiFetch(`/api/admin/users${buildQueryString(query)}`, {
    method: "GET",
  });
  const data = await readJson(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function fetchAdminUserById(userId) {
  const response = await apiFetch(`/api/admin/users/${userId}`, {
    method: "GET",
  });
  const data = await readJson(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function updateAdminUserStatus(userId, status) {
  const response = await apiFetch(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  const data = await readJson(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
