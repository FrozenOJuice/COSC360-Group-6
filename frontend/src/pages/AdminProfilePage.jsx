import { useEffect, useState } from "react";
import { fetchAdminUserById } from "../lib/adminApi";
import { getEmployerProfileByUserId } from "../lib/employerProfileApi";
import { resolveProfileAssetUrl } from "../lib/profileAssetUrl";
import { getSeekerProfileByUserId } from "../lib/seekerProfileApi";
import "../styles/ProfilePage.css";

function AdminProfilePage({ profileRole, userId }) {
  const hasProfileParams = Boolean(profileRole && userId);
  const requestKey = hasProfileParams ? `${profileRole}:${userId}` : "";
  const [profile, setProfile] = useState(null);
  const [managedUser, setManagedUser] = useState(null);
  const [loadedRequestKey, setLoadedRequestKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasProfileParams) {
      return;
    }

    let cancelled = false;

    const profileRequest = profileRole === "employer"
      ? getEmployerProfileByUserId(userId)
      : getSeekerProfileByUserId(userId);
    const userRequest = fetchAdminUserById(userId);

    Promise.all([profileRequest, userRequest])
      .then(([profileResponse, userResponse]) => {
        if (!cancelled) {
          if (!profileResponse.ok) {
            throw profileResponse.error || new Error("Failed to load profile");
          }

          if (!userResponse.ok) {
            throw userResponse.error || new Error("Failed to load user");
          }

          setProfile(profileResponse.data);
          setManagedUser(userResponse.data?.user || null);
          setError("");
          setLoadedRequestKey(requestKey);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setProfile(null);
          setManagedUser(null);
          setError(err.message || "Failed to load profile");
          setLoadedRequestKey(requestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasProfileParams, profileRole, requestKey, userId]);

  if (!hasProfileParams) {
    return <div className="profile-container">Profile not found.</div>;
  }

  const loading = loadedRequestKey !== requestKey;
  const resolvedError = loadedRequestKey === requestKey ? error : "";

  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (resolvedError) {
    return <div className="profile-container">{resolvedError}</div>;
  }

  const profileTypeLabel = profileRole === "employer" ? "Employer" : "Seeker";
  const visibilityValue = profile?.visibility === "public" ? "public" : "private";
  const visibilityLabel = visibilityValue === "public" ? "Public" : "Private";
  const visibilityDescription = visibilityValue === "public"
    ? "This profile is visible to the public."
    : "This profile is only visible to the owner and admins.";
  const accountStatusLabel = managedUser?.status
    ? managedUser.status.charAt(0).toUpperCase() + managedUser.status.slice(1)
    : "Unknown";

  return (
    <div className="profile-container">
      <div className="profile-flex">
        <div className="profile-main-card">
          <div className="profile-header">
            <div>
              <h1>{profileTypeLabel} Profile</h1>
              <p className="profile-admin-copy">Admin read-only view</p>
            </div>
            <div className="profile-actions">
              <a className="profile-button profile-link" href="#admin-users">
                Back to Users
              </a>
            </div>
          </div>

          {profileRole === "employer" ? (
            <>
              <div className="profile-section">
                <h2>Company Name</h2>
                <p>{profile?.companyName || "No company name available."}</p>
              </div>
              <div className="profile-section">
                <h2>Company Description</h2>
                <p>{profile?.companyDescription || "No company description available."}</p>
              </div>
              <div className="profile-section">
                <h2>Location</h2>
                <p>{profile?.location || "No location available."}</p>
              </div>
              <div className="profile-section">
                <h2>Website</h2>
                {profile?.website ? (
                  <a className="profile-link" href={profile.website} target="_blank" rel="noreferrer">
                    Visit Website
                  </a>
                ) : (
                  <p>No website available.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="profile-section">
                <h2>Bio</h2>
                <p>{profile?.bio || "No bio available."}</p>
              </div>
              <div className="profile-section">
                <h2>Job Experience</h2>
                {Array.isArray(profile?.jobExperience) && profile.jobExperience.length ? (
                  <ul>
                    {profile.jobExperience.map((job, index) => (
                      <li key={`${profile.id}-job-${index}`}>{job}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No job experience listed.</p>
                )}
              </div>
              <div className="profile-section">
                <h2>Education</h2>
                {Array.isArray(profile?.education) && profile.education.length ? (
                  <ul>
                    {profile.education.map((edu, index) => (
                      <li key={`${profile.id}-edu-${index}`}>{edu}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No education listed.</p>
                )}
              </div>
              <div className="profile-section">
                <h2>Current Position</h2>
                <p>{profile?.currentPosition || "No current position available."}</p>
              </div>
              <div className="profile-section">
                <h2>Resume</h2>
                {profile?.resumeLink && profile.resumeLink !== "#" ? (
                  <a className="profile-link" href={profile.resumeLink} target="_blank" rel="noreferrer">
                    Open Resume
                  </a>
                ) : (
                  <p>No resume link available.</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="profile-side-card">
          <img
            src={resolveProfileAssetUrl(
              profileRole === "employer" ? profile?.logo : profile?.profilePicture
            )}
            alt={profileRole === "employer" ? "Company logo" : "Profile picture"}
            className="profile-image"
          />

          <div className="profile-visibility-card">
            <div className="profile-visibility-header">
              <p className="profile-visibility-label">Visibility</p>
              <span className={`profile-visibility-badge profile-visibility-badge-${visibilityValue}`}>
                {visibilityLabel}
              </span>
            </div>
            <p className="profile-visibility-copy">{visibilityDescription}</p>
          </div>

          <div className="profile-side-details">
            <h2>Admin Context</h2>
            <p><strong>Name:</strong> {managedUser?.name || "Unknown user"}</p>
            <p><strong>Status:</strong> {accountStatusLabel}</p>
            <p><strong>User ID:</strong> {profile?.userId || userId}</p>
            <p><strong>Role:</strong> {profileTypeLabel}</p>
            {profileRole === "employer" ? (
              <>
                <p><strong>Contact Email:</strong> {profile?.contactEmail || "No contact email available."}</p>
                <p><strong>Contact Phone:</strong> {profile?.contactPhone || "No contact phone number."}</p>
              </>
            ) : (
              <p><strong>Phone Number:</strong> {profile?.phone || "No phone number."}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage;
