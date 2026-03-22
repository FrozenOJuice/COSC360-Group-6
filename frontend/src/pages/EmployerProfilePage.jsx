import { useAuth } from "../auth/useAuth";
import {
  getCurrentEmployerProfile,
  removeCurrentEmployerLogo,
  uploadCurrentEmployerLogo,
  updateCurrentEmployerProfile,
} from "../lib/employerProfileApi";
import { useProfileEditor } from "../profile/useProfileEditor";
import { resolveProfileAssetUrl } from "../lib/profileAssetUrl";
import "../styles/ProfilePage.css";

function createEmployerDraft(profile, user) {
  return {
    companyName: profile?.companyName || user?.name || "",
    companyDescription: profile?.companyDescription || "",
    website: profile?.website || "",
    logo: profile?.logo || "/default-profile.png",
    location: profile?.location || "",
    contactEmail: profile?.contactEmail || user?.email || "",
    contactPhone: profile?.contactPhone || "",
    visibility: profile?.visibility === "public" ? "public" : "private",
  };
}

function EmployerProfilePage() {
  const { user } = useAuth();
  const {
    profile,
    draft,
    fieldErrors,
    loading,
    error,
    isEditing,
    isSaving,
    isUploadingImage,
    isRemovingImage,
    saveError,
    saveSuccess,
    handleDraftChange,
    getControlClass,
    startEditing,
    cancelEditing,
    saveDraft,
    uploadProfileImage,
    removeProfileImage,
  } = useProfileEditor({
    user,
    createDraft: createEmployerDraft,
    loadProfile: getCurrentEmployerProfile,
    loadErrorMessage: "Failed to load employer profile",
    saveProfile: updateCurrentEmployerProfile,
    buildSavePayload: (nextDraft) => ({
      companyName: nextDraft.companyName,
      companyDescription: nextDraft.companyDescription,
      website: nextDraft.website,
      location: nextDraft.location,
      contactEmail: nextDraft.contactEmail,
      contactPhone: nextDraft.contactPhone,
      visibility: nextDraft.visibility,
    }),
    saveErrorMessage: "Failed to update employer profile",
    saveSuccessMessage: "Employer profile updated successfully.",
    uploadImage: uploadCurrentEmployerLogo,
    uploadErrorMessage: "Failed to upload employer logo",
    uploadSuccessMessage: "Employer logo uploaded successfully.",
    removeImage: removeCurrentEmployerLogo,
    removeErrorMessage: "Failed to remove employer logo",
    removeSuccessMessage: "Employer logo removed.",
    imageFieldName: "logo",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    await saveDraft();
  }

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadProfileImage(file);
    event.target.value = "";
  }

  async function handleRemoveLogo() {
    await removeProfileImage();
  }

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
  };
  const visibilityValue = isEditing ? draft.visibility : profile?.visibility;
  const visibilityLabel = visibilityValue === "public" ? "Public" : "Private";
  const visibilityDescription = visibilityValue === "public"
    ? "Anyone can view your employer profile."
    : "Only you and admins can view your employer profile.";
  const hasCustomLogo = profile?.logo && profile.logo !== "/default-profile.png";

  return (
    <div className="profile-container">
      <form className="profile-flex" onSubmit={handleSubmit} noValidate>
        <div className="profile-main-card">
          <div className="profile-header">
            <h1>Employer Profile</h1>
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="profile-button profile-button-secondary"
                    onClick={cancelEditing}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-button"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="profile-button"
                  onClick={startEditing}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          {saveError ? <p className="profile-status profile-status-error">{saveError}</p> : null}
          {saveSuccess ? <p className="profile-status profile-status-success">{saveSuccess}</p> : null}
          <div className="profile-section">
            <h2>Company Name</h2>
            {isEditing ? (
              <input
                className={getControlClass("profile-input", "companyName")}
                type="text"
                name="companyName"
                value={draft.companyName}
                onChange={handleDraftChange}
              />
            ) : (
              <p>{profileData.companyName}</p>
            )}
            {isEditing && fieldErrors.companyName ? <p className="profile-field-error">{fieldErrors.companyName}</p> : null}
          </div>
          <div className="profile-section">
            <h2>Company Description</h2>
            {isEditing ? (
              <textarea
                className={getControlClass("profile-textarea", "companyDescription")}
                name="companyDescription"
                value={draft.companyDescription}
                onChange={handleDraftChange}
                rows={6}
              />
            ) : (
              <p>{profileData.companyDescription}</p>
            )}
            {isEditing && fieldErrors.companyDescription ? <p className="profile-field-error">{fieldErrors.companyDescription}</p> : null}
          </div>
          <div className="profile-section">
            <h2>Location</h2>
            {isEditing ? (
              <input
                className={getControlClass("profile-input", "location")}
                type="text"
                name="location"
                value={draft.location}
                onChange={handleDraftChange}
              />
            ) : (
              <p>{profileData.location}</p>
            )}
            {isEditing && fieldErrors.location ? <p className="profile-field-error">{fieldErrors.location}</p> : null}
          </div>
          <div className="profile-section">
            <h2>Website</h2>
            {isEditing ? (
              <input
                className={getControlClass("profile-input", "website")}
                type="text"
                name="website"
                value={draft.website}
                onChange={handleDraftChange}
              />
            ) : profileData.website ? (
              <a className="profile-link" href={profileData.website} target="_blank" rel="noreferrer">
                Visit Website
              </a>
            ) : (
              <p>No website available.</p>
            )}
            {isEditing && fieldErrors.website ? <p className="profile-field-error">{fieldErrors.website}</p> : null}
          </div>
        </div>
        <div className="profile-side-card">
          <img
            src={resolveProfileAssetUrl(
              isEditing ? draft.logo : profileData.logo
            )}
            alt="Company logo"
            className="profile-image"
          />
          {isEditing ? (
            <div className="profile-media-stack">
              <label className="profile-field">
                <span>Company Logo</span>
                <input
                  className={getControlClass("profile-file-input", "logo")}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoUpload}
                  disabled={isUploadingImage || isRemovingImage}
                />
              </label>
              <div className="profile-media-actions">
                <p className="profile-helper-copy profile-media-helper">
                  JPG, PNG, GIF, or WebP only, up to 5 MB.
                </p>
                {hasCustomLogo ? (
                  <button
                    type="button"
                    className="profile-inline-button profile-inline-button-muted"
                    onClick={handleRemoveLogo}
                    disabled={isUploadingImage || isRemovingImage}
                  >
                    {isRemovingImage ? "Removing..." : "Remove Logo"}
                  </button>
                ) : null}
              </div>
              {isUploadingImage ? <p className="profile-helper-copy profile-media-helper">Uploading image...</p> : null}
              {fieldErrors.logo ? <p className="profile-field-error">{fieldErrors.logo}</p> : null}
            </div>
          ) : null}
          <div className="profile-visibility-card">
            <div className="profile-visibility-header">
              <p className="profile-visibility-label">Visibility</p>
              <span className={`profile-visibility-badge profile-visibility-badge-${visibilityValue}`}>
                {visibilityLabel}
              </span>
            </div>
            <p className="profile-visibility-copy">{visibilityDescription}</p>
            {isEditing ? (
              <label className="profile-field profile-visibility-field">
                <span>Who can view this profile</span>
                <select
                  className={getControlClass("profile-select", "visibility")}
                  name="visibility"
                  value={draft.visibility}
                  onChange={handleDraftChange}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
            ) : null}
            {isEditing && fieldErrors.visibility ? <p className="profile-field-error">{fieldErrors.visibility}</p> : null}
          </div>
          <div className="profile-side-details">
            <h2>Contact Information</h2>
            <p><strong>Account Name:</strong> {user?.name || "N/A"}</p>
            <p><strong>Account Email:</strong> {user?.email || "N/A"}</p>
            {isEditing ? (
              <>
                <label className="profile-field">
                  <span>Contact Email</span>
                  <input
                    className={getControlClass("profile-input", "contactEmail")}
                    type="text"
                    name="contactEmail"
                    value={draft.contactEmail}
                    onChange={handleDraftChange}
                  />
                </label>
                {fieldErrors.contactEmail ? <p className="profile-field-error">{fieldErrors.contactEmail}</p> : null}
                <label className="profile-field">
                  <span>Contact Phone</span>
                  <input
                    className={getControlClass("profile-input", "contactPhone")}
                    type="text"
                    name="contactPhone"
                    value={draft.contactPhone}
                    onChange={handleDraftChange}
                  />
                </label>
                {fieldErrors.contactPhone ? <p className="profile-field-error">{fieldErrors.contactPhone}</p> : null}
              </>
            ) : (
              <>
                <p><strong>Contact Email:</strong> {profileData.contactEmail}</p>
                <p><strong>Contact Phone:</strong> {profileData.contactPhone}</p>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default EmployerProfilePage;
