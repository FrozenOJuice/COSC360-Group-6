import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { API_BASE_URL } from "../lib/api";
import {
  getCurrentSeekerProfile,
  getSeekerProfileByUserId,
  removeCurrentSeekerProfilePicture,
  removeCurrentSeekerResume,
  uploadCurrentSeekerProfilePicture,
  updateCurrentSeekerProfile,
  uploadCurrentSeekerResume,
} from "../lib/seekerProfileApi";
import ProfileEditorFrame from "../profile/ProfileEditorFrame";
import {
  ProfileArraySection,
  ProfileTextAreaSection,
  ProfileTextInputSection,
} from "../profile/ProfileFieldSections";
import ProfileMediaPanel from "../profile/ProfileMediaPanel";
import ProfileVisibilityCard from "../profile/ProfileVisibilityCard";
import { useProfileEditor } from "../profile/useProfileEditor";
import { useProfileStream } from "../profile/useProfileStream";
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
    resume: profile?.resume || "",
    visibility: profile?.visibility === "public" ? "public" : "private",
  };
}

function JobSeekerProfilePage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const isViewingOtherProfile = !!userId;
  
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isRemovingResume, setIsRemovingResume] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const loadProfile = useCallback(() => {
    return isViewingOtherProfile
      ? getSeekerProfileByUserId(userId)
      : getCurrentSeekerProfile();
  }, [isViewingOtherProfile, userId]);

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
    reload,
  } = useProfileEditor({
    user,
    createDraft: createSeekerDraft,
    loadProfile,
    loadErrorMessage: "Failed to load profile",
    saveProfile: updateCurrentSeekerProfile,
    buildSavePayload: (nextDraft) => ({
      bio: nextDraft.bio,
      jobExperience: normalizeEditableList(nextDraft.jobExperience),
      education: normalizeEditableList(nextDraft.education),
      currentPosition: nextDraft.currentPosition,
      phone: nextDraft.phone,
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

  if (!isViewingOtherProfile) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useProfileStream("/api/seeker-profile/me/stream", reload);
  }

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

  async function handleResumeUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingResume(true);
    setResumeError("");
    const result = await uploadCurrentSeekerResume(file);
    if (result.ok) {
      setDraft((current) => ({ ...current, resume: result.data?.resume || "" }));
    } else {
      setResumeError(result.error?.message || "Failed to upload resume");
    }
    setIsUploadingResume(false);
    event.target.value = "";
  }

  async function handleRemoveResume() {
    setIsRemovingResume(true);
    setResumeError("");
    const result = await removeCurrentSeekerResume();
    if (result.ok) {
      setDraft((current) => ({ ...current, resume: "" }));
    } else {
      setResumeError(result.error?.message || "Failed to remove resume");
    }
    setIsRemovingResume(false);
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
    resume: profile?.resume || "",
  };
  const visibilityValue = isEditing ? draft.visibility : profile?.visibility;
  const hasCustomProfilePicture = profile?.profilePicture && profile.profilePicture !== "/default-profile.png";

  return (
    <ProfileEditorFrame
      title={isViewingOtherProfile ? "Job Seeker Profile" : "Seeker Profile"}
      isEditing={!isViewingOtherProfile && isEditing}
      isSaving={isSaving}
      onEdit={!isViewingOtherProfile ? startEditing : null}
      onCancel={!isViewingOtherProfile ? cancelEditing : null}
      onSubmit={!isViewingOtherProfile ? handleSubmit : null}
      saveError={saveError}
      saveSuccess={saveSuccess}
      sideContent={(
        <div className="profile-side-card">
          <ProfileMediaPanel
            imageSrc={!isViewingOtherProfile && isEditing ? draft.profilePicture : profileData.profilePicture}
            imageAlt="Profile Picture"
            isEditing={!isViewingOtherProfile && isEditing}
            inputLabel="Profile Picture"
            inputClassName={getControlClass("profile-file-input", "profilePicture")}
            accept="image/jpeg,image/png,image/gif,image/webp"
            onFileChange={!isViewingOtherProfile ? handleProfilePictureUpload : null}
            isUploading={isUploadingImage}
            isRemoving={isRemovingImage}
            hasCustomImage={hasCustomProfilePicture}
            onRemove={!isViewingOtherProfile ? handleRemoveProfilePicture : null}
            removeLabel="Remove Picture"
            fieldError={fieldErrors.profilePicture}
          />
          {!isViewingOtherProfile && (
            <ProfileVisibilityCard
              value={visibilityValue}
              isEditing={isEditing}
              selectClassName={getControlClass("profile-select", "visibility")}
              onChange={handleDraftChange}
              error={fieldErrors.visibility}
              publicDescription="Anyone can view your seeker profile."
              privateDescription="Only you and admins can view your seeker profile."
            />
          )}
          <div className="profile-side-details">
            <h2>Personal Information</h2>
            {isViewingOtherProfile ? (
              <p className="profile-info-notice">View this user's seeker profile details above.</p>
            ) : (
              <>
                <p><strong>Username:</strong> {user?.username || "N/A"}</p>
                <p><strong>Full Name:</strong> {user?.name || "N/A"}</p>
                <p><strong>Email:</strong> {user?.email || "N/A"}</p>
              </>
            )}
            {!isViewingOtherProfile && isEditing ? (
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
        isEditing={!isViewingOtherProfile && isEditing}
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
        isEditing={!isViewingOtherProfile && isEditing}
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
        isEditing={!isViewingOtherProfile && isEditing}
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
        isEditing={!isViewingOtherProfile && isEditing}
        inputClassName={getControlClass("profile-input", "currentPosition")}
        name="currentPosition"
        value={draft.currentPosition}
        onChange={handleDraftChange}
        displayValue={profileData.currentPosition}
        error={fieldErrors.currentPosition}
      />
      <section className="profile-section">
        <h2>Resume</h2>
        {!isViewingOtherProfile && isEditing ? (
          <div className="profile-field">
            <label className="profile-file-input">
              <span>{isUploadingResume ? "Uploading..." : "Upload PDF"}</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                disabled={isUploadingResume || isRemovingResume}
              />
            </label>
            {draft.resume && (
              <button
                type="button"
                className="profile-remove-button"
                onClick={handleRemoveResume}
                disabled={isUploadingResume || isRemovingResume}
              >
                {isRemovingResume ? "Removing..." : "Remove Resume"}
              </button>
            )}
            {resumeError && <p className="profile-field-error">{resumeError}</p>}
          </div>
        ) : (
          profileData.resume
            ? <a href={`${API_BASE_URL}${profileData.resume}`} target="_blank" rel="noreferrer">View Resume</a>
            : <p>No resume uploaded.</p>
        )}
      </section>
    </ProfileEditorFrame>
  );
}

export default JobSeekerProfilePage;
