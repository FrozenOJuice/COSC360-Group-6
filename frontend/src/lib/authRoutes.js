export function getCurrentPage(hash) {
  if (hash === "#login") return "login";
  if (hash.startsWith("#employer")) return "employer";
  if (hash.startsWith("#job-seeker")) return "jobSeeker";
  return hash === "#register" ? "register" : "home";
}

export function getLandingHash(role) {
  if (role === "employer") return "#employer";
  return "#job-seeker";
}

export function getRequiredRoleForPage(page) {
  if (page === "employer") return "employer";
  if (page === "jobSeeker") return "seeker";
  return null;
}
