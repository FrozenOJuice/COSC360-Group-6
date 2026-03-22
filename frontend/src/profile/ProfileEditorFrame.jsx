function ProfileEditorFrame({
  title,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSubmit,
  saveError,
  saveSuccess,
  children,
  sideContent,
  editLabel = "Edit Profile",
}) {
  return (
    <div className="profile-container">
      <form className="profile-flex" onSubmit={onSubmit} noValidate>
        <div className="profile-main-card">
          <div className="profile-header">
            <h1>{title}</h1>
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="profile-button profile-button-secondary"
                    onClick={onCancel}
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
                  onClick={onEdit}
                >
                  {editLabel}
                </button>
              )}
            </div>
          </div>
          {saveError ? <p className="profile-status profile-status-error">{saveError}</p> : null}
          {saveSuccess ? <p className="profile-status profile-status-success">{saveSuccess}</p> : null}
          {children}
        </div>
        {sideContent}
      </form>
    </div>
  );
}

export default ProfileEditorFrame;
