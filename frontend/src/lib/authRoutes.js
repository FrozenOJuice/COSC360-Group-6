const JOB_DETAILS_HASH_PATTERN = /^#jobs\/([^/]+)$/;

export function getCurrentPage(hash) {
  if (hash === "#login") return "login";
  if (JOB_DETAILS_HASH_PATTERN.test(hash)) return "jobDetails";
  if (hash.startsWith("#jobs")) return "jobs";
  if (hash.startsWith("#admin")) return "admin";
  if (hash.startsWith("#employer-profile")) return "employerProfile";
  if (hash.startsWith("#employer")) return "employer";
  if (hash.startsWith("#job-seeker-profile")) return "jobSeekerProfile";
  if (hash.startsWith("#job-seeker")) return "jobSeeker";
  return hash === "#register" ? "register" : "home";
}

export function getJobIdFromHash(hash) {
  const match = hash.match(JOB_DETAILS_HASH_PATTERN);
  return match ? match[1] : "";
}

export function getLandingHash(role) {
  if (role === "admin") return "#admin";
  if (role === "employer") return "#employer";
  return "#job-seeker";
}

export function getRequiredRoleForPage(page) {
  if (page.startsWith("admin")) return "admin";
  if (page.startsWith("employer")) return "employer";
  if (page.startsWith("jobSeeker")) return "seeker";
  return null;
}
