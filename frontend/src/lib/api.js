export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

let refreshPromise = null;

export function buildApiUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export async function apiRequest(path, options = {}) {
  return fetch(buildApiUrl(path), {
    credentials: "include",
    ...options,
  });
}

export async function requestSessionRefresh() {
  if (!refreshPromise) {
    refreshPromise = apiRequest("/api/auth/refresh", {
      method: "POST",
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(path, options = {}, allowRetry = true) {
  const response = await apiRequest(path, options);

  if (response.status !== 401 || !allowRetry || path === "/api/auth/refresh") {
    return response;
  }

  const refreshResponse = await requestSessionRefresh();
  if (!refreshResponse.ok) {
    return response;
  }

  return apiRequest(path, options);
}
