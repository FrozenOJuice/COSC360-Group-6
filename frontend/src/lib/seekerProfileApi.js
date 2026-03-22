import { mapResultData, requestJson } from "./api.js";

async function requestSeekerProfile(path, options, fallbackMessage) {
  const result = await requestJson(path, options, { fallbackMessage });
  return mapResultData(result, (data) => data ?? null);
}

export async function getCurrentSeekerProfile() {
  return requestSeekerProfile("/api/seeker-profile/me", {
    method: "GET",
  }, "Failed to fetch seeker profile");
}

export async function getSeekerProfileByUserId(userId) {
  return requestSeekerProfile(`/api/seeker-profile/${userId}`, {
    method: "GET",
  }, "Failed to fetch seeker profile");
}

export async function uploadCurrentSeekerProfilePicture(file) {
  const formData = new FormData();
  formData.append("image", file);

  return requestSeekerProfile("/api/seeker-profile/me/picture", {
    method: "POST",
    body: formData,
  }, "Failed to upload profile picture");
}

export async function removeCurrentSeekerProfilePicture() {
  return requestSeekerProfile("/api/seeker-profile/me/picture", {
    method: "DELETE",
  }, "Failed to remove profile picture");
}

export async function updateCurrentSeekerProfile(profileData) {
  return requestSeekerProfile("/api/seeker-profile/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  }, "Failed to update seeker profile");
}
