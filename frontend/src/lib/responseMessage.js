export async function getResponseMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    const detailMessage = Array.isArray(data?.details)
      ? data.details.find((detail) => typeof detail?.message === "string" && detail.message.trim())?.message
      : null;

    if (detailMessage) {
      return detailMessage;
    }

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ignore unreadable response bodies and fall back to the provided message.
  }

  return fallbackMessage;
}
