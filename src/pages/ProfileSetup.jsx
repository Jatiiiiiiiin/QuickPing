import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../style/ProfileSetup.css';
import Hyperspeed from '../components/Hyperspeed';

function ProfileSetup() {
  const defaultAvatar = 'https://lh3.googleusercontent.com/a-/default-user-avatar.png';
  const [avatar, setAvatar] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) return alert('Please log in first.');

    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        avatar: avatar || defaultAvatar,
      });
      alert('Profile saved successfully!');
      navigate('/home');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="profile-page">
      <div className="hyperspeed-bg">
      <Hyperspeed
        effectOptions={{
          onSpeedUp: () => { },
          onSlowDown: () => { },
          distortion: 'turbulentDistortion',
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xFFFFFF,
            brokenLines: 0xFFFFFF,
            leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
            rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
            sticks: 0x03B3C3,
          }
        }}
      />
      </div>
      <div
        className="profile-overlay">
        <div className="profile-content">
          <div className="avatar-wrapper">
            <input
              type="file"
              id="avatarInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <div
              className="setup-avatar"
              style={{ backgroundImage: `url("${avatar || defaultAvatar}")` }}
            ></div>
            <button
              className="edit-avatar-btn"
              onClick={() => document.getElementById('avatarInput').click()}
              title="Change photo"
            >
              ✎
            </button>
          </div>

          <h2>Welcome!</h2>
          <p className="subtitle">Let’s complete your profile</p>

          <div className="input-group">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <button className="btn primary" onClick={handleSubmit}>
            Proceed
          </button>
        </div>
      </div>

      <footer className="profile-footer">
        <p>&copy; 2025 QuickPing. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ProfileSetup;
