import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../style/ProfileSetup.css';
import bg from '../assets/bg.png';

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
      <div
        className="profile-container"
        style={{
          background: `url(${bg}) no-repeat center center fixed`,
          backgroundSize: 'cover',
        }}
      >
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
