import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getCurrentSeekerProfile } from '../lib/seekerProfileApi';
import '../styles/ProfilePage.css';

function JobSeekerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      getCurrentSeekerProfile()
        .then(setProfile)
        .catch((err) => {
          console.error('Failed to fetch profile:', err);
          setError('Failed to load profile');
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  const profileData = {
    bio: profile?.bio || 'No bio available.',
    jobExperience: profile?.jobExperience || ['No job experience listed.'],
    education: profile?.education || ['No education listed.'],
    currentPosition: profile?.currentPosition || 'No current position.',
    profilePicture: profile?.profilePicture || '/default-profile.png',
    phone: profile?.phone || 'No phone number.',
    resumeLink: profile?.resumeLink || '#',
  };

  return (
    <div className="profile-container">
      <div className="profile-flex">
        <div className="profile-main-card">
          <h1>Seeker Profile</h1>
          <div className="profile-section">
            <h2>Bio</h2>
            <p>{profileData.bio}</p>
          </div>
          <div className="profile-section">
            <h2>Job Experience</h2>
            <ul>
              {profileData.jobExperience.map((job, index) => (
                <li key={index}>{job}</li>
              ))}
            </ul>
          </div>
          <div className="profile-section">
            <h2>Education</h2>
            <ul>
              {profileData.education.map((edu, index) => (
                <li key={index}>{edu}</li>
              ))}
            </ul>
          </div>
          <div className="profile-section">
            <h2>Current Job Position</h2>
            <p>{profileData.currentPosition}</p>
          </div>
          <div className="profile-section">
            <h2>Visibility</h2>
            <p>{profile?.visibility === 'public' ? 'Public' : 'Private'}</p>
          </div>
          <div className="profile-section">
            <h2>Resume</h2>
            <a className="profile-link" href={profileData.resumeLink} download>Download Resume</a>
          </div>
        </div>
        <div className="profile-side-card">
          <img src={profileData.profilePicture} alt="Profile Picture" className="profile-image" />
          <div className="profile-side-details">
            <h2>Personal Information</h2>
            <p><strong>Full Name:</strong> {user?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Phone Number:</strong> {profileData.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerProfilePage;
