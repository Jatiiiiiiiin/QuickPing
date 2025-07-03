import React, { useState, useEffect } from 'react';
import QRScanner from '../QRScanner';
import YourQR from '../YourQR';

const FriendConnectUI = ({
  activeTab,
  setActiveTab,
  scannedUID,
  setScannedUID,
  manualUID,
  setManualUID,
  sendFriendRequest,
  receivedRequests,
  handleAccept,
  activeFriend,
  activeGroup,
}) => {
  const [animateBody, setAnimateBody] = useState(false);

  useEffect(() => {
    if (activeFriend || activeGroup) {
      setAnimateBody(false);
      requestAnimationFrame(() => {
        setAnimateBody(true);
      });
    }
  }, [activeFriend, activeGroup]);

  return (
    <div className="friend-connect-ui">
      
      <div className="connect-tabs">
        <button
          className={`connect-tab-btn ${activeTab === 'connect' ? 'active' : ''}`}
          onClick={() => setActiveTab('connect')}
        >
          Connect Friend
        </button>
        <button
          className={`connect-tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr')}
        >
          Your QR
        </button>
        <button
          className={`connect-tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Create / Join Group
        </button>
      </div>

      {/* 🔄 Tab Content */}
      <div className={`tab-content ${animateBody ? 'animate' : ''}`}>
        {activeTab === 'connect' && (
          <div className="connect-friend">
            <div className="qr-section">
              <p>Scan QR to connect</p>
              <QRScanner onScan={(uid) => setScannedUID(uid)} />
            </div>

            {scannedUID && (
              <div className="qr-confirm-box">
                <p>
                  Send friend request to: <b>{scannedUID}</b>?
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="accept-btn"
                    onClick={() => {
                      sendFriendRequest(scannedUID);
                      setScannedUID(null);
                    }}
                  >
                    Send Request
                  </button>
                  <button className="reject-btn" onClick={() => setScannedUID(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="manual-uid">
              <input
                type="text"
                placeholder="Enter UID"
                value={manualUID}
                onChange={(e) => setManualUID(e.target.value)}
              />
              <button onClick={() => sendFriendRequest(manualUID)}>Send Request</button>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="your-qr">
            <YourQR />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="group-options">
            <p>
              To create or join a group, go back and click the "New Conversation" button →
              then select "Create / Join Group" tab again here.
            </p>
            <p>
              <b>(Full form is shown inside `GroupConnectUI` component)</b>
            </p>
          </div>
        )}

        {(activeTab === 'connect' || activeTab === 'qr') && (
          <>
            <h4>Friend Requests</h4>
            {receivedRequests.length === 0 ? (
              <p>No friend requests</p>
            ) : (
              receivedRequests.map((uid) => (
                <div className="request-card" key={uid}>
                  <div className="request-info">
                    <span>{uid}</span>
                    <div className="accept-btn" onClick={() => handleAccept(uid)}>
                      <div tabIndex="0" className="plusButton">
                        <svg className="plusIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                          <path d="M13.75 23.75V16.25H6.25V13.75H13.75V6.25H16.25V13.75H23.75V16.25H16.25V23.75H13.75Z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendConnectUI;
