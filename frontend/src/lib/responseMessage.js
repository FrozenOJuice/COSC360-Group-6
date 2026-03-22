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

export async function createResponseError(response, fallbackMessage) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  const fieldErrors = buildFieldErrors(data?.details);
  const detailMessage = Object.values(fieldErrors).find(
    (message) => typeof message === "string" && message.trim()
  );
  const message = detailMessage
    || (typeof data?.message === "string" && data.message.trim() ? data.message : "")
    || fallbackMessage;

  const error = new Error(message);
  error.status = response.status;
  error.fieldErrors = fieldErrors;
  error.details = data?.details;
  return error;
}
