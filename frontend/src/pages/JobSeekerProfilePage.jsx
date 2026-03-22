import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import {
  getCurrentSeekerProfile,
  updateCurrentSeekerProfile,
} from '../lib/seekerProfileApi';
import '../styles/ProfilePage.css';

function createEditableList(values) {
  return Array.isArray(values) && values.length ? values : [''];
}

function normalizeEditableList(values) {
  return Array.isArray(values)
    ? values.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
}

function createSeekerDraft(profile) {
  return {
    bio: profile?.bio || '',
    jobExperience: createEditableList(profile?.jobExperience),
    education: createEditableList(profile?.education),
    currentPosition: profile?.currentPosition || '',
    profilePicture: profile?.profilePicture || '/default-profile.png',
    phone: profile?.phone || '',
    resumeLink: profile?.resumeLink || '#',
    visibility: profile?.visibility === 'public' ? 'public' : 'private',
  };
}

function JobSeekerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(createSeekerDraft(null));
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getCurrentSeekerProfile()
        .then((data) => {
          setProfile(data);
          setDraft(createSeekerDraft(data));
          setError(null);
        })
        .catch((err) => {
          console.error('Failed to fetch profile:', err);
          setError(err.message || 'Failed to load profile');
        })
        .finally(() => setLoading(false));
  }, [user?.id]);

  function handleDraftChange(event) {
    const { name, value } = event.target;
    setDraft((currentDraft) => ({
      ...currentDraft,
      [name]: value,
    }));
    setFieldErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function handleListItemChange(fieldName, index, value) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [fieldName]: currentDraft[fieldName].map((item, itemIndex) => (
        itemIndex === index ? value : item
      )),
    }));
    setFieldErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  }

  function handleAddListItem(fieldName) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [fieldName]: [...currentDraft[fieldName], ''],
    }));
  }

  function handleRemoveListItem(fieldName, index) {
    setDraft((currentDraft) => {
      const nextItems = currentDraft[fieldName].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...currentDraft,
        [fieldName]: nextItems.length ? nextItems : [''],
      };
    });
  }

  function handleStartEditing() {
    setDraft(createSeekerDraft(profile));
    setFieldErrors({});
    setSaveError('');
    setSaveSuccess('');
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setDraft(createSeekerDraft(profile));
    setFieldErrors({});
    setSaveError('');
    setSaveSuccess('');
    setIsEditing(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setSaveError('');
    setSaveSuccess('');

    try {
      const updatedProfile = await updateCurrentSeekerProfile({
        bio: draft.bio,
        jobExperience: normalizeEditableList(draft.jobExperience),
        education: normalizeEditableList(draft.education),
        currentPosition: draft.currentPosition,
        profilePicture: draft.profilePicture,
        phone: draft.phone,
        resumeLink: draft.resumeLink,
        visibility: draft.visibility,
      });

      setProfile(updatedProfile);
      setDraft(createSeekerDraft(updatedProfile));
      setIsEditing(false);
      setSaveSuccess('Profile updated successfully.');
    } catch (err) {
      const nextFieldErrors = err?.fieldErrors || {};
      setFieldErrors(nextFieldErrors);
      setSaveError(Object.keys(nextFieldErrors).length === 0 ? (err.message || 'Failed to update profile') : '');
    } finally {
      setIsSaving(false);
    }
  }

  function getControlClass(baseClass, fieldName) {
    return fieldErrors[fieldName] ? `${baseClass} profile-control-error` : baseClass;
  }

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  const profileData = {
    bio: profile?.bio || 'No bio available.',
    jobExperience: profile?.jobExperience?.length ? profile.jobExperience : ['No job experience listed.'],
    education: profile?.education?.length ? profile.education : ['No education listed.'],
    currentPosition: profile?.currentPosition || 'No current position.',
    profilePicture: profile?.profilePicture || '/default-profile.png',
    phone: profile?.phone || 'No phone number.',
    resumeLink: profile?.resumeLink || '#',
  };
  const visibilityValue = isEditing ? draft.visibility : profile?.visibility;
  const visibilityLabel = visibilityValue === 'public' ? 'Public' : 'Private';
  const visibilityDescription = visibilityValue === 'public'
    ? 'Anyone can view your seeker profile.'
    : 'Only you and admins can view your seeker profile.';

  return (
    <div className="profile-container">
      <form className="profile-flex" onSubmit={handleSubmit} noValidate>
        <div className="profile-main-card">
          <div className="profile-header">
            <h1>Seeker Profile</h1>
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="profile-button profile-button-secondary"
                    onClick={handleCancelEditing}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-button"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="profile-button"
                  onClick={handleStartEditing}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          {saveError ? <p className="profile-status profile-status-error">{saveError}</p> : null}
          {saveSuccess ? <p className="profile-status profile-status-success">{saveSuccess}</p> : null}
          <div className="profile-section">
            <h2>Bio</h2>
            {isEditing ? (
              <textarea
                className={getControlClass('profile-textarea', 'bio')}
                name="bio"
                value={draft.bio}
                onChange={handleDraftChange}
                rows={5}
              />
            ) : (
              <p>{profileData.bio}</p>
            )}
            {isEditing && fieldErrors.bio ? <p className="profile-field-error">{fieldErrors.bio}</p> : null}
          </div>
          <div className="profile-section">
            <h2>Job Experience</h2>
            {isEditing ? (
              <div className="profile-array-editor">
                <p className="profile-helper-copy">Add each role or experience entry separately.</p>
                {draft.jobExperience.map((job, index) => (
                  <div key={`job-experience-${index}`} className="profile-array-row">
                    <input
                      className={getControlClass('profile-input', 'jobExperience')}
                      type="text"
                      value={job}
                      onChange={(event) => handleListItemChange('jobExperience', index, event.target.value)}
                      placeholder="Example: Marketing Intern at Acme"
                    />
                    <button
                      type="button"
                      className="profile-inline-button profile-inline-button-muted"
                      onClick={() => handleRemoveListItem('jobExperience', index)}
                      disabled={draft.jobExperience.length === 1 && !draft.jobExperience[0].trim()}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="profile-inline-button"
                  onClick={() => handleAddListItem('jobExperience')}
                >
                  Add Experience
                </button>
                {fieldErrors.jobExperience ? <p className="profile-field-error">{fieldErrors.jobExperience}</p> : null}
              </div>
            ) : (
              <ul>
                {profileData.jobExperience.map((job, index) => (
                  <li key={index}>{job}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="profile-section">
            <h2>Education</h2>
            {isEditing ? (
              <div className="profile-array-editor">
                <p className="profile-helper-copy">Add each school, degree, or program separately.</p>
                {draft.education.map((edu, index) => (
                  <div key={`education-${index}`} className="profile-array-row">
                    <input
                      className={getControlClass('profile-input', 'education')}
                      type="text"
                      value={edu}
                      onChange={(event) => handleListItemChange('education', index, event.target.value)}
                      placeholder="Example: BSc Computer Science, UBC Okanagan"
                    />
                    <button
                      type="button"
                      className="profile-inline-button profile-inline-button-muted"
                      onClick={() => handleRemoveListItem('education', index)}
                      disabled={draft.education.length === 1 && !draft.education[0].trim()}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="profile-inline-button"
                  onClick={() => handleAddListItem('education')}
                >
                  Add Education
                </button>
                {fieldErrors.education ? <p className="profile-field-error">{fieldErrors.education}</p> : null}
              </div>
            ) : (
              <ul>
                {profileData.education.map((edu, index) => (
                  <li key={index}>{edu}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="profile-section">
            <h2>Current Job Position</h2>
            {isEditing ? (
              <input
                className={getControlClass('profile-input', 'currentPosition')}
                type="text"
                name="currentPosition"
                value={draft.currentPosition}
                onChange={handleDraftChange}
              />
            ) : (
              <p>{profileData.currentPosition}</p>
            )}
            {isEditing && fieldErrors.currentPosition ? <p className="profile-field-error">{fieldErrors.currentPosition}</p> : null}
          </div>
          <div className="profile-section">
            <h2>Resume</h2>
            {isEditing ? (
              <input
                className={getControlClass('profile-input', 'resumeLink')}
                type="text"
                name="resumeLink"
                value={draft.resumeLink}
                onChange={handleDraftChange}
              />
            ) : profileData.resumeLink && profileData.resumeLink !== '#' ? (
              <a className="profile-link" href={profileData.resumeLink} target="_blank" rel="noreferrer">
                Open Resume
              </a>
            ) : (
              <p>No resume link available.</p>
            )}
            {isEditing && fieldErrors.resumeLink ? <p className="profile-field-error">{fieldErrors.resumeLink}</p> : null}
          </div>
        </div>
        <div className="profile-side-card">
          <img
            src={isEditing ? (draft.profilePicture || '/default-profile.png') : profileData.profilePicture}
            alt="Profile Picture"
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
            {isEditing ? (
              <label className="profile-field profile-visibility-field">
                <span>Who can view this profile</span>
                <select
                  className={getControlClass('profile-select', 'visibility')}
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
            <h2>Personal Information</h2>
            <p><strong>Full Name:</strong> {user?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            {isEditing ? (
              <>
                <label className="profile-field">
                  <span>Profile Picture URL</span>
                  <input
                    className={getControlClass('profile-input', 'profilePicture')}
                    type="text"
                    name="profilePicture"
                    value={draft.profilePicture}
                    onChange={handleDraftChange}
                  />
                </label>
                {fieldErrors.profilePicture ? <p className="profile-field-error">{fieldErrors.profilePicture}</p> : null}
                <label className="profile-field">
                  <span>Phone Number</span>
                  <input
                    className={getControlClass('profile-input', 'phone')}
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
      </form>
    </div>
  );
}

export default JobSeekerProfilePage;
