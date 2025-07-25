import React, { useEffect, useState } from 'react';
import '../style/Settings.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { uploadToCloudinary } from '../utils/uploadToCloudinary'; // ✅

function Setting() {
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [activeTab, setActiveTab] = useState('edit-profile');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    try {
      const downloadURL = await uploadToCloudinary(file);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { avatar: downloadURL });

      setUserData((prev) => ({ ...prev, avatar: downloadURL }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Try again.");
    }
  };

  const handleTabClick = (tab) => {
    if (tab === activeTab) return;
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, 400); // simulate loading delay
  };

  useEffect(() => {
    const getUserData = async () => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);

          const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          setName(fullName);
          setLocation(data.location || '');
          setBio(data.bio || '');
        }
      }
    };
    getUserData();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        location,
        bio
      });
      alert('Profile updated successfully!');
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="edit-profile-container">
      <aside className="pannel">
        <ul>
          <li className={activeTab === 'edit-profile' ? 'active' : ''} onClick={() => handleTabClick('edit-profile')}>Edit profile</li>
          <li className={activeTab === 'password' ? 'active' : ''} onClick={() => handleTabClick('password')}>Password</li>
          <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => handleTabClick('notifications')}>Notifications</li>
          <li className={activeTab === 'chat-export' ? 'active' : ''} onClick={() => handleTabClick('chat-export')}>Chat export</li>
          <li className={activeTab === 'sessions' ? 'active' : ''} onClick={() => handleTabClick('sessions')}>Sessions</li>
          <li className={activeTab === 'applications' ? 'active' : ''} onClick={() => handleTabClick('applications')}>Applications</li>
          <li className={activeTab === 'team' ? 'active' : ''} onClick={() => handleTabClick('team')}>Team</li>
        </ul>
        <button className="delete-btn">❌ Delete account</button>
      </aside>

      <main className={`profile-form ${isLoading ? 'fade-in' : ''}`}>
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            {activeTab === 'edit-profile' && (
              <>
                <h2>Edit profile</h2>

                <div className="avatar-section">
                  <img
                    src={userData?.avatar || "https://ui-avatars.com/api/?name=User"}
                    alt="avatar"
                    className="avatar"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    id="avatarInput"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />

                  <div>
                    <button
                      className="upload-btn"
                      onClick={() => document.getElementById('avatarInput').click()}
                    >
                      Upload new image
                    </button>
                    <p className="avatar-note">
                      At least 800×800 px recommended. JPG, PNG, or GIF allowed
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={name} disabled />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Delhi, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    placeholder="Short bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={880}
                  />
                </div>
                <button onClick={handleSave}>
                  <div class="svg-wrapper-1">
                    <div class="svg-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="30"
                        height="30"
                        class="icon"
                      >
                        <path
                          d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <span>Save</span>
                </button>

              </>
            )}

            {activeTab !== 'edit-profile' && (
              <h2 style={{ color: 'white' }}>{activeTab.replace('-', ' ').toUpperCase()}</h2>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Setting;
