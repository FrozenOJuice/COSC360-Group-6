import { apiFetch } from "./api.js";

export async function getCurrentEmployerProfile() {
  const response = await apiFetch("/api/employer-profile/me", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch employer profile");
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
    throw new Error("Failed to update employer profile");
  }

  const data = await response.json();
  return data.data;
}
