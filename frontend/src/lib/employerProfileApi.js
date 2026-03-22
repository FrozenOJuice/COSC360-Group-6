import { mapResultData, requestJson } from "./api.js";

async function requestEmployerProfile(path, options, fallbackMessage) {
  const result = await requestJson(path, options, { fallbackMessage });
  return mapResultData(result, (payload) => payload.data ?? null);
}

export async function getCurrentEmployerProfile() {
  return requestEmployerProfile("/api/employer-profile/me", {
    method: "GET",
  }, "Failed to fetch employer profile");
}

export async function getEmployerProfileByUserId(userId) {
  return requestEmployerProfile(`/api/employer-profile/${userId}`, {
    method: "GET",
  }, "Failed to fetch employer profile");
}

export async function uploadCurrentEmployerLogo(file) {
  const formData = new FormData();
  formData.append("image", file);

  return requestEmployerProfile("/api/employer-profile/me/logo", {
    method: "POST",
    body: formData,
  }, "Failed to upload employer logo");
}

export async function removeCurrentEmployerLogo() {
  return requestEmployerProfile("/api/employer-profile/me/logo", {
    method: "DELETE",
  }, "Failed to remove employer logo");
}

export async function updateCurrentEmployerProfile(profileData) {
  return requestEmployerProfile("/api/employer-profile/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  }, "Failed to update employer profile");
}
