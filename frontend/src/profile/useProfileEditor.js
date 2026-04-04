import { useEffect, useState } from "react";

function removeFieldError(fieldErrors, fieldName) {
  if (!fieldErrors[fieldName]) {
    return fieldErrors;
  }

  const nextFieldErrors = { ...fieldErrors };
  delete nextFieldErrors[fieldName];
  return nextFieldErrors;
}

export function useProfileEditor({
  user,
  createDraft,
  loadProfile,
  loadErrorMessage,
  saveProfile,
  buildSavePayload = (draft) => draft,
  saveErrorMessage,
  saveSuccessMessage,
  uploadImage,
  uploadErrorMessage,
  uploadSuccessMessage,
  removeImage,
  removeErrorMessage,
  removeSuccessMessage,
  imageFieldName,
}) {
  const currentUserId = user?.id || "";
  const [rawProfile, setRawProfile] = useState(null);
  const [resolvedUserId, setResolvedUserId] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const [draft, setDraft] = useState(() => createDraft(null, user));
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  function reload() {
    setReloadVersion((v) => v + 1);
  }

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    let cancelled = false;

    async function syncProfile() {

      const result = await loadProfile();

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setRawProfile(null);
        setError(result.error?.message || loadErrorMessage);
        setResolvedUserId(currentUserId);
        return;
      }

      setRawProfile(result.data);
      setDraft(createDraft(result.data, user));
      setError(null);
      setResolvedUserId(currentUserId);
    }

    void syncProfile();

    return () => {
      cancelled = true;
    };
  }, [createDraft, currentUserId, loadErrorMessage, loadProfile, reloadVersion, user]);

  const profile = currentUserId && resolvedUserId === currentUserId ? rawProfile : null;
  const resolvedError = currentUserId && resolvedUserId === currentUserId ? error : null;
  const loading = Boolean(currentUserId) && resolvedUserId !== currentUserId;

  function clearStatus() {
    setSaveError("");
    setSaveSuccess("");
  }

  function clearFieldError(fieldName) {
    setFieldErrors((currentFieldErrors) => removeFieldError(currentFieldErrors, fieldName));
  }

  function handleDraftChange(event) {
    const { name, value } = event.target;

    setDraft((currentDraft) => ({
      ...currentDraft,
      [name]: value,
    }));
    clearFieldError(name);
  }

  function getControlClass(baseClass, fieldName) {
    return fieldErrors[fieldName] ? `${baseClass} profile-control-error` : baseClass;
  }

  function startEditing() {
    setDraft(createDraft(profile, user));
    setFieldErrors({});
    clearStatus();
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(createDraft(profile, user));
    setFieldErrors({});
    clearStatus();
    setIsEditing(false);
  }

  async function saveDraft() {
    setIsSaving(true);
    setFieldErrors({});
    clearStatus();

    try {
      const result = await saveProfile(buildSavePayload(draft));
      if (!result.ok) {
        const nextFieldErrors = result.error?.fieldErrors || {};
        setFieldErrors(nextFieldErrors);
        setSaveError(
          Object.keys(nextFieldErrors).length === 0
            ? (result.error?.message || saveErrorMessage)
            : ""
        );
        return result;
      }

      setRawProfile(result.data);
      setResolvedUserId(currentUserId);
      setDraft(createDraft(result.data, user));
      setIsEditing(false);
      setSaveSuccess(saveSuccessMessage);
      return result;
    } catch (err) {
      const nextFieldErrors = err?.fieldErrors || {};
      setFieldErrors(nextFieldErrors);
      setSaveError(
        Object.keys(nextFieldErrors).length === 0
          ? (err.message || saveErrorMessage)
          : ""
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadProfileImage(file) {
    setIsUploadingImage(true);
    clearStatus();
    clearFieldError(imageFieldName);

    try {
      const result = await uploadImage(file);
      if (!result.ok) {
        const nextFieldErrors = result.error?.fieldErrors || {};
        setFieldErrors((currentFieldErrors) => ({
          ...currentFieldErrors,
          ...nextFieldErrors,
        }));

        if (!nextFieldErrors[imageFieldName]) {
          setSaveError(result.error?.message || uploadErrorMessage);
        }

        return result;
      }

      setRawProfile(result.data);
      setResolvedUserId(currentUserId);
      setDraft((currentDraft) => ({
        ...currentDraft,
        [imageFieldName]: result.data[imageFieldName],
      }));
      setSaveSuccess(uploadSuccessMessage);
      return result;
    } catch (err) {
      const nextFieldErrors = err?.fieldErrors || {};
      setFieldErrors((currentFieldErrors) => ({
        ...currentFieldErrors,
        ...nextFieldErrors,
      }));

      if (!nextFieldErrors[imageFieldName]) {
        setSaveError(err.message || uploadErrorMessage);
      }

      throw err;
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function removeProfileImage() {
    setIsRemovingImage(true);
    clearStatus();
    clearFieldError(imageFieldName);

    try {
      const result = await removeImage();
      if (!result.ok) {
        const nextFieldErrors = result.error?.fieldErrors || {};
        setFieldErrors((currentFieldErrors) => ({
          ...currentFieldErrors,
          ...nextFieldErrors,
        }));

        if (!nextFieldErrors[imageFieldName]) {
          setSaveError(result.error?.message || removeErrorMessage);
        }

        return result;
      }

      setRawProfile(result.data);
      setResolvedUserId(currentUserId);
      setDraft((currentDraft) => ({
        ...currentDraft,
        [imageFieldName]: result.data[imageFieldName],
      }));
      setSaveSuccess(removeSuccessMessage);
      return result;
    } catch (err) {
      const nextFieldErrors = err?.fieldErrors || {};
      setFieldErrors((currentFieldErrors) => ({
        ...currentFieldErrors,
        ...nextFieldErrors,
      }));

      if (!nextFieldErrors[imageFieldName]) {
        setSaveError(err.message || removeErrorMessage);
      }

      throw err;
    } finally {
      setIsRemovingImage(false);
    }
  }

  return {
    profile,
    draft,
    setDraft,
    fieldErrors,
    loading,
    error: resolvedError,
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
  };
}
