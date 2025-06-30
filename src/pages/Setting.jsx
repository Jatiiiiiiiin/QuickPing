import React, { useState } from 'react';
import '../style/Settings.css';

function Setting() {
  const [activeTab, setActiveTab] = useState('edit-profile');
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const handleTabClick = (tab) => {
    if (tab === activeTab) return;
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, 400); // simulate loading delay
  };

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
                  <img src="https://via.placeholder.com/100" alt="avatar" className="avatar" />
                  <div>
                    <button className="upload-btn">Upload new image</button>
                    <p className="avatar-note">
                      At least 800×800 px recommended. JPG or PNG and GIF is allowed
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Username or email"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

export default Setting;
