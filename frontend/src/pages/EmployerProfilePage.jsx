import { useAuth } from "../auth/useAuth";
import {
  getCurrentEmployerProfile,
  removeCurrentEmployerLogo,
  uploadCurrentEmployerLogo,
  updateCurrentEmployerProfile,
} from "../lib/employerProfileApi";
import ProfileEditorFrame from "../profile/ProfileEditorFrame";
import {
  ProfileLinkSection,
  ProfileTextAreaSection,
  ProfileTextInputSection,
} from "../profile/ProfileFieldSections";
import ProfileMediaPanel from "../profile/ProfileMediaPanel";
import ProfileVisibilityCard from "../profile/ProfileVisibilityCard";
import { useProfileEditor } from "../profile/useProfileEditor";
import { useProfileStream } from "../profile/useProfileStream";
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
    reload,
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

  useProfileStream("/api/employer-profile/me/stream", reload);

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
  const hasCustomLogo = profile?.logo && profile.logo !== "/default-profile.png";

  return (
    <ProfileEditorFrame
      title="Employer Profile"
      isEditing={isEditing}
      isSaving={isSaving}
      onEdit={startEditing}
      onCancel={cancelEditing}
      onSubmit={handleSubmit}
      saveError={saveError}
      saveSuccess={saveSuccess}
      sideContent={(
        <div className="profile-side-card">
          <ProfileMediaPanel
            imageSrc={isEditing ? draft.logo : profileData.logo}
            imageAlt="Company logo"
            isEditing={isEditing}
            inputLabel="Company Logo"
            inputClassName={getControlClass("profile-file-input", "logo")}
            accept="image/jpeg,image/png,image/gif,image/webp"
            onFileChange={handleLogoUpload}
            isUploading={isUploadingImage}
            isRemoving={isRemovingImage}
            hasCustomImage={hasCustomLogo}
            onRemove={handleRemoveLogo}
            removeLabel="Remove Logo"
            fieldError={fieldErrors.logo}
          />
          <ProfileVisibilityCard
            value={visibilityValue}
            isEditing={isEditing}
            selectClassName={getControlClass("profile-select", "visibility")}
            onChange={handleDraftChange}
            error={fieldErrors.visibility}
            publicDescription="Anyone can view your employer profile."
            privateDescription="Only you and admins can view your employer profile."
          />
          <div className="profile-side-details">
            <h2>Contact Information</h2>
            <p><strong>Username:</strong> {user?.username || "N/A"}</p>
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
      )}
    >
      <ProfileTextInputSection
        title="Company Name"
        isEditing={isEditing}
        inputClassName={getControlClass("profile-input", "companyName")}
        name="companyName"
        value={draft.companyName}
        onChange={handleDraftChange}
        displayValue={profileData.companyName}
        error={fieldErrors.companyName}
      />
      <ProfileTextAreaSection
        title="Company Description"
        isEditing={isEditing}
        inputClassName={getControlClass("profile-textarea", "companyDescription")}
        name="companyDescription"
        value={draft.companyDescription}
        onChange={handleDraftChange}
        displayValue={profileData.companyDescription}
        error={fieldErrors.companyDescription}
        rows={6}
      />
      <ProfileTextInputSection
        title="Location"
        isEditing={isEditing}
        inputClassName={getControlClass("profile-input", "location")}
        name="location"
        value={draft.location}
        onChange={handleDraftChange}
        displayValue={profileData.location}
        error={fieldErrors.location}
      />
      <ProfileLinkSection
        title="Website"
        isEditing={isEditing}
        inputClassName={getControlClass("profile-input", "website")}
        name="website"
        value={draft.website}
        onChange={handleDraftChange}
        href={profileData.website}
        linkLabel="Visit Website"
        emptyText="No website available."
        error={fieldErrors.website}
      />
    </ProfileEditorFrame>
  );
}

export default EmployerProfilePage;
