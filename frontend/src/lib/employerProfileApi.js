import { apiFetch } from "./api.js";
import { createResponseError } from "./responseMessage.js";

export async function getCurrentEmployerProfile() {
  const response = await apiFetch("/api/employer-profile/me", {
    method: "GET",
  });

  if (!response.ok) {
    throw await createResponseError(response, "Failed to fetch employer profile");
  }

  const data = await response.json();
  return data.data;
}

export async function getEmployerProfileByUserId(userId) {
  const response = await apiFetch(`/api/employer-profile/${userId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw await createResponseError(response, "Failed to fetch employer profile");
  }

  const data = await response.json();
  return data.data;
}

export async function updateCurrentEmployerProfile(profileData) {
  const response = await apiFetch("/api/employer-profile/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw await createResponseError(response, "Failed to update employer profile");
  }

  const data = await response.json();
  return data.data;
}
