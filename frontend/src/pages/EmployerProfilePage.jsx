import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { getCurrentEmployerProfile } from "../lib/employerProfileApi";
import "../styles/ProfilePage.css";

function EmployerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    getCurrentEmployerProfile()
      .then(setProfile)
      .catch((err) => {
        console.error("Failed to fetch employer profile:", err);
        setError("Failed to load employer profile");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  const profileData = {
    companyName: profile?.companyName || user?.name || "No company name available.",
    companyDescription: profile?.companyDescription || "No company description available.",
    website: profile?.website || "",
    logo: profile?.logo || "/default-profile.png",
    location: profile?.location || "No location available.",
    contactEmail: profile?.contactEmail || user?.email || "No contact email available.",
    contactPhone: profile?.contactPhone || "No contact phone number.",
    visibility: profile?.visibility === "public" ? "Public" : "Private",
  };

  return (
    <div className="profile-container">
      <div className="profile-flex">
        <div className="profile-main-card">
          <h1>Employer Profile</h1>
          <div className="profile-section">
            <h2>Company Name</h2>
            <p>{profileData.companyName}</p>
          </div>
          <div className="profile-section">
            <h2>Company Description</h2>
            <p>{profileData.companyDescription}</p>
          </div>
          <div className="profile-section">
            <h2>Location</h2>
            <p>{profileData.location}</p>
          </div>
          <div className="profile-section">
            <h2>Visibility</h2>
            <p>{profileData.visibility}</p>
          </div>
          <div className="profile-section">
            <h2>Website</h2>
            {profileData.website ? (
              <a
                className="profile-link"
                href={profileData.website}
                target="_blank"
                rel="noreferrer"
              >
                Visit Website
              </a>
            ) : (
              <p>No website available.</p>
            )}
          </div>
        </div>
        <div className="profile-side-card">
          <img
            src={profileData.logo}
            alt="Company logo"
            className="profile-image"
          />
          <div className="profile-side-details">
            <h2>Contact Information</h2>
            <p><strong>Account Name:</strong> {user?.name || "N/A"}</p>
            <p><strong>Account Email:</strong> {user?.email || "N/A"}</p>
            <p><strong>Contact Email:</strong> {profileData.contactEmail}</p>
            <p><strong>Contact Phone:</strong> {profileData.contactPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerProfilePage;
