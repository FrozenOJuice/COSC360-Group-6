export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const NETWORK_ERROR_MESSAGE = "Could not connect to the server.";

let refreshPromise = null;

export function buildApiUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export function buildQueryString(query = {}) {
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

function buildFieldErrors(details) {
  if (!Array.isArray(details)) {
    return {};
  }

  return details.reduce((fieldErrors, detail) => {
    if (typeof detail?.field !== "string" || typeof detail?.message !== "string") {
      return fieldErrors;
    }

    const rootField = detail.field.split(".")[0];
    if (!rootField || rootField === "body" || fieldErrors[rootField]) {
      return fieldErrors;
    }

    return {
      ...fieldErrors,
      [rootField]: detail.message,
    };
  }, {});
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function createResponseError(data, status, fallbackMessage) {
  const fieldErrors = buildFieldErrors(data?.details);
  const detailMessage = Object.values(fieldErrors).find(
    (message) => typeof message === "string" && message.trim()
  );
  const message = detailMessage
    || (typeof data?.message === "string" && data.message.trim() ? data.message : "")
    || fallbackMessage;

  const error = new Error(message);
  error.status = status;
  error.fieldErrors = fieldErrors;
  error.details = data?.details;
  return error;
}

function apiRequest(path, options = {}) {
  return fetch(buildApiUrl(path), {
    credentials: "include",
    ...options,
  });
}

async function parseJsonResponse(response, fallbackMessage) {
  const payload = await readJson(response);

  if (response.ok) {
    const data = payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : null;

    return {
      ok: true,
      status: response.status,
      data,
      error: null,
    };
  }

  return {
    ok: false,
    status: response.status,
    data: payload,
    error: createResponseError(payload, response.status, fallbackMessage),
  };
}

export function createNetworkErrorResult(message = NETWORK_ERROR_MESSAGE) {
  const error = new Error(message);
  error.status = 0;
  error.fieldErrors = {};
  error.details = [];

    return {
      ok: false,
      status: 0,
      data: {
        success: false,
        status: 0,
        details: [],
        message,
      },
    error,
  };
}

export function mapResultData(result, selectData) {
  if (!result.ok) {
    return result;
  }

  return {
    ...result,
    data: selectData(result.data),
  };
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

export async function requestJson(path, options = {}, { allowRetry = true, fallbackMessage = "Request failed", networkErrorMessage = NETWORK_ERROR_MESSAGE, } = {}) {
  try {
    const response = await apiFetch(path, options, allowRetry);
    return parseJsonResponse(response, fallbackMessage);
  } catch {
    return createNetworkErrorResult(networkErrorMessage);
  }
}

export async function requestSessionRefreshJson({ fallbackMessage = "Could not refresh session", networkErrorMessage = NETWORK_ERROR_MESSAGE, } = {}) {
  try {
    const response = await requestSessionRefresh();
    return parseJsonResponse(response, fallbackMessage);
  } catch {
    return createNetworkErrorResult(networkErrorMessage);
  }
}
