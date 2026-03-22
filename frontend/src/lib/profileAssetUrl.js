import { buildApiUrl } from "./api.js";

export function resolveProfileAssetUrl(value, fallback = "/default-profile.png") {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  if (value.startsWith("/uploads/")) {
    return buildApiUrl(value);
  }

  return value;
}
