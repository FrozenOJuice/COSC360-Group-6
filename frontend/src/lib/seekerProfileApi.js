import { apiFetch } from "./api.js";
import { createResponseError } from "./responseMessage.js";

export async function getCurrentSeekerProfile() {
  const response = await apiFetch("/api/seeker-profile/me", {
    method: "GET",
  });

  if (!response.ok) {
    throw await createResponseError(response, "Failed to fetch seeker profile");
  }

  const data = await response.json();
  return data.data;
}

export async function getSeekerProfileByUserId(userId) {
  const response = await apiFetch(`/api/seeker-profile/${userId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw await createResponseError(response, "Failed to fetch seeker profile");
  }

  const data = await response.json();
  return data.data;
}

export async function uploadCurrentSeekerProfilePicture(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiFetch("/api/seeker-profile/me/picture", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw await createResponseError(response, "Failed to upload profile picture");
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
    throw await createResponseError(response, "Failed to update seeker profile");
  }

  const data = await response.json();
  return data.data;
}
