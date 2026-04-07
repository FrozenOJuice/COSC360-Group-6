export const routePaths = Object.freeze({
  home: "/",
  login: "/login",
  register: "/register",
  jobs: "/jobs",
  jobDetails: "/jobs/:jobId",
  admin: "/admin",
  adminProfile: "/admin/profiles/:profileRole/:userId",
  employer: "/employer",
  employerProfile: "/employer/profile",
  jobSeeker: "/job-seeker",
  jobSeekerProfile: "/job-seeker/profile",
  jobSeekerProfileById: "/job-seeker/profile/:userId",
});

export function withHash(path, hash) {
  if (!hash) {
    return path;
  }

  const normalizedHash = hash.startsWith("#") ? hash : `#${hash}`;
  return `${path}${normalizedHash}`;
}

export function getJobDetailsPath(jobId) {
  return `${routePaths.jobs}/${jobId}`;
}

export function getJobSeekerProfilePath(userId) {
  return `/job-seeker/profile/${userId}`;
}

export function getAdminProfilePath(profileRole, userId) {
  return `/admin/profiles/${profileRole}/${userId}`;
}

export function getLandingPath(role) {
  if (role === "admin") return routePaths.admin;
  if (role === "employer") return routePaths.employer;
  if (role === "seeker") return routePaths.jobSeeker;
  return routePaths.home;
}

export function getNavbarVariant(user) {
  if (user?.role === "admin") return "admin";
  if (user?.role === "seeker") return "jobSeeker";
  if (user?.role === "employer") return "employer";
  return "public";
}
