import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getUserProfile } from '../lib/profileApi';
import '../styles/JobSeekerProfilePage.css';

function JobSeekerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      getUserProfile()
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
        <div className="left-box">
          <h1>Profile Page</h1>
          <div className="bio">
            <h2>Bio</h2>
            <p>{profileData.bio}</p>
          </div>
          <div className="job-experience">
            <h2>Job Experience</h2>
            <ul>
              {profileData.jobExperience.map((job, index) => (
                <li key={index}>{job}</li>
              ))}
            </ul>
          </div>
          <div className="education">
            <h2>Education</h2>
            <ul>
              {profileData.education.map((edu, index) => (
                <li key={index}>{edu}</li>
              ))}
            </ul>
          </div>
          <div className="current-position">
            <h2>Current Job Position</h2>
            <p>{profileData.currentPosition}</p>
          </div>
          <div className="resume">
            <h2>Resume</h2>
            <a href={profileData.resumeLink} download>Download Resume</a>
          </div>
        </div>
        <div className="right-box">
          <img src={profileData.profilePicture} alt="Profile Picture" className="profile-picture" />
          <div className="personal-info">
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
