function ProfileVisibilityCard({
  value,
  isEditing,
  selectClassName,
  onChange,
  error,
  publicDescription,
  privateDescription,
}) {
  const visibilityValue = value === "public" ? "public" : "private";
  const visibilityLabel = visibilityValue === "public" ? "Public" : "Private";
  const visibilityDescription = visibilityValue === "public"
    ? publicDescription
    : privateDescription;

  return (
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
            className={selectClassName}
            name="visibility"
            value={visibilityValue}
            onChange={onChange}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
      ) : null}
      {isEditing && error ? <p className="profile-field-error">{error}</p> : null}
    </div>
  );
}

export default ProfileVisibilityCard;
