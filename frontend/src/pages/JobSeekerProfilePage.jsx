import { useAuth } from "../auth/useAuth";
import {
  getCurrentSeekerProfile,
  removeCurrentSeekerProfilePicture,
  uploadCurrentSeekerProfilePicture,
  updateCurrentSeekerProfile,
} from "../lib/seekerProfileApi";
import ProfileEditorFrame from "../profile/ProfileEditorFrame";
import {
  ProfileArraySection,
  ProfileLinkSection,
  ProfileTextAreaSection,
  ProfileTextInputSection,
} from "../profile/ProfileFieldSections";
import ProfileMediaPanel from "../profile/ProfileMediaPanel";
import ProfileVisibilityCard from "../profile/ProfileVisibilityCard";
import { useProfileEditor } from "../profile/useProfileEditor";
import "../styles/ProfilePage.css";

function createEditableList(values) {
  return Array.isArray(values) && values.length ? values : [""];
}

function normalizeEditableList(values) {
  return Array.isArray(values)
    ? values.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

function createSeekerDraft(profile) {
  return {
    bio: profile?.bio || "",
    jobExperience: createEditableList(profile?.jobExperience),
    education: createEditableList(profile?.education),
    currentPosition: profile?.currentPosition || "",
    profilePicture: profile?.profilePicture || "/default-profile.png",
    phone: profile?.phone || "",
    resumeLink: profile?.resumeLink || "",
    visibility: profile?.visibility === "public" ? "public" : "private",
  };
}

function JobSeekerProfilePage() {
  const { user } = useAuth();
  const {
    profile,
    draft,
    setDraft,
    fieldErrors,
    loading,
    error,
    isEditing,
    isSaving,
    isUploadingImage,
    isRemovingImage,
    saveError,
    saveSuccess,
    clearFieldError,
    handleDraftChange,
    getControlClass,
    startEditing,
    cancelEditing,
    saveDraft,
    uploadProfileImage,
    removeProfileImage,
  } = useProfileEditor({
    user,
    createDraft: createSeekerDraft,
    loadProfile: getCurrentSeekerProfile,
    loadErrorMessage: "Failed to load profile",
    saveProfile: updateCurrentSeekerProfile,
    buildSavePayload: (nextDraft) => ({
      bio: nextDraft.bio,
      jobExperience: normalizeEditableList(nextDraft.jobExperience),
      education: normalizeEditableList(nextDraft.education),
      currentPosition: nextDraft.currentPosition,
      phone: nextDraft.phone,
      resumeLink: nextDraft.resumeLink,
      visibility: nextDraft.visibility,
    }),
    saveErrorMessage: "Failed to update profile",
    saveSuccessMessage: "Profile updated successfully.",
    uploadImage: uploadCurrentSeekerProfilePicture,
    uploadErrorMessage: "Failed to upload profile picture",
    uploadSuccessMessage: "Profile picture uploaded successfully.",
    removeImage: removeCurrentSeekerProfilePicture,
    removeErrorMessage: "Failed to remove profile picture",
    removeSuccessMessage: "Profile picture removed.",
    imageFieldName: "profilePicture",
  });

  function handleListItemChange(fieldName, index, value) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [fieldName]: currentDraft[fieldName].map((item, itemIndex) => (
        itemIndex === index ? value : item
      )),
    }));
    clearFieldError(fieldName);
  }

  function handleAddListItem(fieldName) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [fieldName]: [...currentDraft[fieldName], ""],
    }));
  }

  function handleRemoveListItem(fieldName, index) {
    setDraft((currentDraft) => {
      const nextItems = currentDraft[fieldName].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...currentDraft,
        [fieldName]: nextItems.length ? nextItems : [""],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await saveDraft();
  }

  async function handleProfilePictureUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await uploadProfileImage(file);
    event.target.value = "";
  }

  async function handleRemoveProfilePicture() {
    await removeProfileImage();
  }

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  const profileData = {
    bio: profile?.bio || "No bio available.",
    jobExperience: profile?.jobExperience?.length ? profile.jobExperience : ["No job experience listed."],
    education: profile?.education?.length ? profile.education : ["No education listed."],
    currentPosition: profile?.currentPosition || "No current position.",
    profilePicture: profile?.profilePicture || "/default-profile.png",
    phone: profile?.phone || "No phone number.",
    resumeLink: profile?.resumeLink || "",
  };
  const visibilityValue = isEditing ? draft.visibility : profile?.visibility;
  const hasCustomProfilePicture = profile?.profilePicture && profile.profilePicture !== "/default-profile.png";

  return (
    <ProfileEditorFrame
      title="Seeker Profile"
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
            imageSrc={isEditing ? draft.profilePicture : profileData.profilePicture}
            imageAlt="Profile Picture"
            isEditing={isEditing}
            inputLabel="Profile Picture"
            inputClassName={getControlClass("profile-file-input", "profilePicture")}
            accept="image/jpeg,image/png,image/gif,image/webp"
            onFileChange={handleProfilePictureUpload}
            isUploading={isUploadingImage}
            isRemoving={isRemovingImage}
            hasCustomImage={hasCustomProfilePicture}
            onRemove={handleRemoveProfilePicture}
            removeLabel="Remove Picture"
            fieldError={fieldErrors.profilePicture}
          />
          <ProfileVisibilityCard
            value={visibilityValue}
            isEditing={isEditing}
            selectClassName={getControlClass("profile-select", "visibility")}
            onChange={handleDraftChange}
            error={fieldErrors.visibility}
            publicDescription="Anyone can view your seeker profile."
            privateDescription="Only you and admins can view your seeker profile."
          />
          <div className="profile-side-details">
            <h2>Personal Information</h2>
            <p><strong>Full Name:</strong> {user?.name || "N/A"}</p>
            <p><strong>Email:</strong> {user?.email || "N/A"}</p>
            {isEditing ? (
              <>
                <label className="profile-field">
                  <span>Phone Number</span>
                  <input
                    className={getControlClass("profile-input", "phone")}
                    type="text"
                    name="phone"
                    value={draft.phone}
                    onChange={handleDraftChange}
                  />
                </label>
                {fieldErrors.phone ? <p className="profile-field-error">{fieldErrors.phone}</p> : null}
              </>
            ) : (
              <p><strong>Phone Number:</strong> {profileData.phone}</p>
            )}
          </div>
        </div>
      )}
    >
      <ProfileTextAreaSection
        title="Bio"
        isEditing={isEditing}
        inputClassName={getControlClass("profile-textarea", "bio")}
        name="bio"
        value={draft.bio}
        onChange={handleDraftChange}
        displayValue={profileData.bio}
        error={fieldErrors.bio}
        rows={5}
      />
      <ProfileArraySection
        title="Job Experience"
        fieldName="jobExperience"
        isEditing={isEditing}
        items={draft.jobExperience}
        displayItems={profileData.jobExperience}
        inputClassName={getControlClass("profile-input", "jobExperience")}
        placeholder="Example: Marketing Intern at Acme"
        helperText="Add each role or experience entry separately."
        addLabel="Add Experience"
        error={fieldErrors.jobExperience}
        onItemChange={(index, value) => handleListItemChange("jobExperience", index, value)}
        onAddItem={() => handleAddListItem("jobExperience")}
        onRemoveItem={(index) => handleRemoveListItem("jobExperience", index)}
      />
      <ProfileArraySection
        title="Education"
        fieldName="education"
        isEditing={isEditing}
        items={draft.education}
        displayItems={profileData.education}
        inputClassName={getControlClass("profile-input", "education")}
        placeholder="Example: BSc Computer Science, UBC Okanagan"
        helperText="Add each school, degree, or program separately."
        addLabel="Add Education"
        error={fieldErrors.education}
        onItemChange={(index, value) => handleListItemChange("education", index, value)}
        onAddItem={() => handleAddListItem("education")}
        onRemoveItem={(index) => handleRemoveListItem("education", index)}
      />
      <ProfileTextInputSection
        title="Current Job Position"
        isEditing={isEditing}
        inputClassName={getControlClass("profile-input", "currentPosition")}
        name="currentPosition"
        value={draft.currentPosition}
        onChange={handleDraftChange}
        displayValue={profileData.currentPosition}
        error={fieldErrors.currentPosition}
      />
      <ProfileLinkSection
        title="Resume"
        isEditing={isEditing}
        inputClassName={getControlClass("profile-input", "resumeLink")}
        name="resumeLink"
        value={draft.resumeLink}
        onChange={handleDraftChange}
        href={profileData.resumeLink}
        linkLabel="Open Resume"
        emptyText="No resume link available."
        error={fieldErrors.resumeLink}
      />
    </ProfileEditorFrame>
  );
}

export default JobSeekerProfilePage;
