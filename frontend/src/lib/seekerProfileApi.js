import { apiFetch } from "./api.js";
import { getResponseMessage } from "./responseMessage.js";

export async function getCurrentSeekerProfile() {
  const response = await apiFetch("/api/seeker-profile/me", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(await getResponseMessage(response, "Failed to fetch seeker profile"));
  }

  const data = await response.json();
  return data.data;
}

export async function updateCurrentSeekerProfile(profileData) {
  const response = await apiFetch("/api/seeker-profile/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error(await getResponseMessage(response, "Failed to update seeker profile"));
  }

  const data = await response.json();
  return data.data;
}
