import React, { useEffect, useState } from 'react';
import '../style/Settings.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getAuth } from 'firebase/auth'
import { storage } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';



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

    const storageRef = ref(storage, `avatars/${currentUser.uid}/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { avatar: downloadURL });

      setUserData((prev) => ({ ...prev, avatar: downloadURL }));
    } catch (err) {
      console.error("Upload failed", err);
    }

  }


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
          const data = userSnap.data(); // ✅ define it once
          setUserData(data);

          const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          setName(fullName); // ✅ use it safely
        }
      }
    };
    getUserData();
  }, [currentUser]);


  return (
    <div className="edit-profile-container">
      <aside className="pannel">
        <ul>
          <li
            className={activeTab === 'edit-profile' ? 'active' : ''}
            onClick={() => handleTabClick('edit-profile')}
          >
            Edit profile
          </li>
          <li
            className={activeTab === 'password' ? 'active' : ''}
            onClick={() => handleTabClick('password')}
          >
            Password
          </li>
          <li
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => handleTabClick('notifications')}
          >
            Notifications
          </li>
          <li
            className={activeTab === 'chat-export' ? 'active' : ''}
            onClick={() => handleTabClick('chat-export')}
          >
            Chat export
          </li>
          <li
            className={activeTab === 'sessions' ? 'active' : ''}
            onClick={() => handleTabClick('sessions')}
          >
            Sessions
          </li>
          <li
            className={activeTab === 'applications' ? 'active' : ''}
            onClick={() => handleTabClick('applications')}
          >
            Applications
          </li>
          <li
            className={activeTab === 'team' ? 'active' : ''}
            onClick={() => handleTabClick('team')}
          >
            Team
          </li>
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
                  <input
                    type="text"
                    value={name}
                    disabled
                  />
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

                <button className="save-btn">Save changes</button>
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
export default Setting
