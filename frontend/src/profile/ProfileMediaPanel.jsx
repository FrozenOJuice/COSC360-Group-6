import { resolveProfileAssetUrl } from "../lib/profileAssetUrl";

function ProfileMediaPanel({
  imageSrc,
  imageAlt,
  isEditing,
  inputLabel,
  inputClassName,
  accept,
  onFileChange,
  isUploading,
  isRemoving,
  hasCustomImage,
  onRemove,
  removeLabel,
  helperText = "JPG, PNG, GIF, or WebP only, up to 5 MB.",
  uploadStatusLabel = "Uploading image...",
  fieldError,
}) {
  return (
    <>
      <img
        src={resolveProfileAssetUrl(imageSrc)}
        alt={imageAlt}
        className="profile-image"
      />
      {isEditing ? (
        <div className="profile-media-stack">
          <label className="profile-field">
            <span>{inputLabel}</span>
            <input
              className={inputClassName}
              type="file"
              accept={accept}
              onChange={onFileChange}
              disabled={isUploading || isRemoving}
            />
          </label>
          <div className="profile-media-actions">
            <p className="profile-helper-copy profile-media-helper">
              {helperText}
            </p>
            {hasCustomImage ? (
              <button
                type="button"
                className="profile-inline-button profile-inline-button-muted"
                onClick={onRemove}
                disabled={isUploading || isRemoving}
              >
                {isRemoving ? "Removing..." : removeLabel}
              </button>
            ) : null}
          </div>
          {isUploading ? (
            <p className="profile-helper-copy profile-media-helper">
              {uploadStatusLabel}
            </p>
          ) : null}
          {fieldError ? <p className="profile-field-error">{fieldError}</p> : null}
        </div>
      ) : null}
    </>
  );
}

export default ProfileMediaPanel;
