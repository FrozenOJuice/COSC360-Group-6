import { apiFetch } from "./api.js";

export async function getUserProfile(userId) {
  const response = await apiFetch(`/api/profile/${userId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  const data = await response.json();
  return data.data;
}

export async function updateUserProfile(userId, profileData) {
  const response = await apiFetch(`/api/profile/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  const data = await response.json();
  return data.data;
}