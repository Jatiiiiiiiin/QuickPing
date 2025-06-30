import React, { useRef, useEffect, useState } from 'react';
import '../style/ChatUI.css';
import { Settings, MessageCircle, Users, FileText, Zap, Send } from 'react-feather';
import { doc, getDoc, setDoc, updateDoc, deleteField, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import YourQR from '../components/YourQR';
import QRScanner from '../components/QRScanner';
import { addDoc, serverTimestamp } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";
import Setting from '../pages/Setting';

const ChatUI = () => {
  const { currentUser } = useAuth();
  const chatBodyRef = useRef(null);
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [activeTab, setActiveTab] = useState('connect');
  const [manualUID, setManualUID] = useState('');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [scannedUID, setScannedUID] = useState(null);
  const [activeFriend, setActiveFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const typingTimeout = useRef(null);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
const windowHeightRef = useRef(window.innerHeight);



  const toggleSettings = () => {
    setShowSettings(prev => !prev)
  };

  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    const timeout = setTimeout(() => {
      if (nearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);


  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen to friend requests
  useEffect(() => {
    if (!currentUser) return;

    const receivedRef = doc(db, 'users', currentUser.uid, 'friendRequests', 'received');
    const unsubscribeReceived = onSnapshot(receivedRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const uids = Object.entries(data || {})
          .filter(([_, status]) => status === true)
          .map(([uid]) => uid);
        setReceivedRequests(uids);
      } else {
        setReceivedRequests([]);
      }
    });

    return () => unsubscribeReceived();
  }, [currentUser]);


  useEffect(() => {
    if (!currentUser) return;

    const friendsColRef = collection(db, 'users', currentUser.uid, 'friends');
    const unsubscribeFriends = onSnapshot(friendsColRef, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push(doc.data()));
      setFriends(list); // updates conversation list
    });

    return () => unsubscribeFriends();
  }, [currentUser]);


  useEffect(() => {
    if (!currentUser || !activeFriend) return;

    const threadId = [currentUser.uid, activeFriend.uid].sort().join('_');
    const messagesRef = collection(db, 'threads', threadId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribeMessages();
  }, [currentUser, activeFriend]);

  useEffect(() => {
    if (!currentUser || !activeFriend) return;

    const threadId = [currentUser.uid, activeFriend.uid].sort().join('_');
    const typingRef = doc(db, 'threads', threadId + '_typing');

    const unsubscribeTyping = onSnapshot(typingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsFriendTyping(data[activeFriend.uid] === true);
      } else {
        setIsFriendTyping(false);
      }
    });

    return () => unsubscribeTyping();
  }, [currentUser, activeFriend]);





  const HandleTyping = async () => {
    if (!activeFriend || !currentUser) return;

    const threadId = [currentUser.uid, activeFriend.uid].sort().join('_');
    const typingRef = doc(db, 'threads', threadId + '_typing');

    const now = Date.now();
    if (!typingTimeout.current) typingTimeout.current = {};

    typingTimeout.current.lastTyped = now;

    try {
      // ✅ Always set to true while user is typing
      await setDoc(typingRef, {
        [currentUser.uid]: true
      }, { merge: true });

      // ✅ Debounced "false" only if 3s have passed without more typing
      setTimeout(() => {
        const timeSinceLastTyped = Date.now() - typingTimeout.current.lastTyped;
        if (timeSinceLastTyped >= 1000) {
          setDoc(typingRef, {
            [currentUser.uid]: false
          }, { merge: true });
        }
      }, 1100);
    } catch (err) {
      console.error("Typing update failed", err);
    }
  };


  useEffect(() => {
    if (!isFriendTyping || !chatBodyRef.current) return;
    const el = chatBodyRef.current;
    el.scrollTop = el.scrollHeight;
  }, [isFriendTyping]);





  const sendFriendRequest = async (uid) => {
    if (!uid || uid === currentUser?.uid) {
      alert("Invalid UID or can't send request to yourself.");
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        alert("User not found.");
        return;
      }

      await setDoc(doc(db, 'users', currentUser.uid, 'friendRequests', 'sent'), {
        [uid]: true
      }, { merge: true });

      await setDoc(doc(db, 'users', uid, 'friendRequests', 'received'), {
        [currentUser.uid]: true
      }, { merge: true });

      alert("Friend request sent!");
      setManualUID('');
    } catch (error) {
      console.error("Friend request error:", error);
      alert("Error sending request.");
    }
  };

  const handleAccept = async (uid) => {
    try {
      const friendSnap = await getDoc(doc(db, 'users', uid));
      const friendData = friendSnap.exists() ? friendSnap.data() : {};

      const currentSnap = await getDoc(doc(db, 'users', currentUser.uid));
      const currentData = currentSnap.exists() ? currentSnap.data() : {};

      const friendName = `${friendData.firstName || ''} ${friendData.lastName || ''}`.trim()
        || friendData.displayName || 'Unnamed';
      const friendAvatar = friendData.avatar || friendData.photoURL || '';

      const myName = `${currentData.firstName || ''} ${currentData.lastName || ''}`.trim()
        || currentUser.displayName || 'Unnamed';
      const myAvatar = currentData.avatar || currentUser.photoURL || '';

      // ✅ Remove request
      await updateDoc(doc(db, 'users', currentUser.uid, 'friendRequests', 'received'), {
        [uid]: deleteField()
      });
      await updateDoc(doc(db, 'users', uid, 'friendRequests', 'sent'), {
        [currentUser.uid]: deleteField()
      });

      // ✅ Save each other as friends with fallback name/avatar
      await setDoc(doc(db, 'users', currentUser.uid, 'friends', uid), {
        uid,
        name: friendName,
        avatar: friendAvatar,
        createdAt: new Date()
      });

      console.log("Writing sender friend doc:", {
        uid: currentUser.uid,
        name: myName,
        avatar: myAvatar
      });

      await setDoc(doc(db, 'users', uid, 'friends', currentUser.uid), {
        uid: currentUser.uid,
        name: myName,
        avatar: myAvatar,
        createdAt: new Date()
      });

      console.log("Sender friend doc written ✅");

      // ✅ Create chat thread
      const threadId = [currentUser.uid, uid].sort().join('_');
      await setDoc(doc(db, 'threads', threadId), {
        participants: [currentUser.uid, uid],
        createdAt: new Date()
      });
    } catch (err) {
      console.error("Accept error:", err);
    }
  };




  const handleReject = async (uid) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'friendRequests', 'received'), {
        [uid]: deleteField()
      });
      await updateDoc(doc(db, 'users', uid, 'friendRequests', 'sent'), {
        [currentUser.uid]: deleteField()
      });
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const sendMessage = async (threadId, text, senderUid) => {
    if (!text.trim()) return;

    try {
      const messageRef = collection(db, "threads", threadId, "messages");
      await addDoc(messageRef, {
        text,
        sender: senderUid,
        timestamp: serverTimestamp(),
      });

      setInputMessage(''); // clear input
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const heightDiff = windowHeightRef.current - currentHeight;

    // If height drops significantly, assume keyboard is open
    if (heightDiff > 150) {
      setIsKeyboardOpen(true);
    } else {
      setIsKeyboardOpen(false);
    }
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);



    return (
      <div className="chat-container">
        <div className="sidebar">
          <div className="icon settings" onClick={toggleSettings}><Settings size={20} /></div>
          <div className="menu-icons">
            <div className="icon"><MessageCircle size={20} /></div>
            <div className="icon"><Users size={20} /></div>
            <div className="icon"><FileText size={20} /></div>
          </div>
          <div className="icon logo"><Zap size={20} /></div>
        </div>

        {showSettings ? (
          <Setting />
        ) : (
          <>
            {/* Conversation List */}
            {(!isMobileView || !mobileChatOpen) && (
              <div className="conversation-list">
                <div className="conversation-scroll">
                  <h2>All Conversations</h2>
                  {friends.length === 0 ? (
                    <p>No conversations yet</p>
                  ) : (
                    friends.map(friend => (
                      <div
                        key={friend.uid}
                        className="conversation"
                        onClick={() => {
                          setActiveFriend(friend);
                          if (isMobileView) setMobileChatOpen(true);
                        }}
                      >
                        <div
                          className="avatar"
                          style={{
                            backgroundImage: `url(${friend.avatar || ''})`,
                            backgroundColor: '#444',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div className="preview">
                          <p className="title">{friend.name || 'Unnamed'}</p>
                          <p className="msg">Click to chat</p>
                        </div>
                      </div>
                    ))

                  )}

                </div>
                <button className="new-convo" onClick={() => {
                  setIsNewConversation(true);
                  if (isMobileView) setMobileChatOpen(true);
                }}
                >+ New Conversation</button>
              </div>
            )}
            {/* Chat Window */}
            {(!isMobileView || mobileChatOpen) && (
              <div className={`chat-window ${isMobileView ? 'mobile-active' : ''}`}

              >
                <button className="back-button" onClick={() => {
                  setMobileChatOpen(false);
                  setIsNewConversation(false);
                  setActiveFriend(null);
                }}>←</button>
                {isNewConversation ? (
                  <div className="friend-connect-ui">

                    {/* Tabs */}
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
                    </div>

                    <div className="request-section">
                      {activeTab === 'connect' ? (
                        <div className="connect-friend">
                          <div className="qr-section">
                            <p>Scan QR to connect</p>
                            <QRScanner onScan={(uid) => setScannedUID(uid)} />
                          </div>

                          {scannedUID && (
                            <div className="qr-confirm-box">
                              <p>Send friend request to: <b>{scannedUID}</b>?</p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="accept-btn" onClick={() => {
                                  sendFriendRequest(scannedUID);
                                  setScannedUID(null);
                                }}>Send Request</button>
                                <button className="reject-btn" onClick={() => setScannedUID(null)}>Cancel</button>
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
                      ) : (
                        <div className="your-qr">
                          <YourQR />
                        </div>
                      )}

                      <h4>Friend Requests</h4>
                      {receivedRequests.length === 0 ? (
                        <p>No friend requests</p>
                      ) : (
                        receivedRequests.map((uid) => (
                          <div className="request-card" key={uid}>
                            <div className="request-info">
                              <span>{uid}</span>
                              <div className="request-actions">
                                <button className="accept-btn" onClick={() => handleAccept(uid)}>Accept</button>
                                <button className="reject-btn" onClick={() => handleReject(uid)}>Reject</button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {activeFriend ? (
                      <>
                        <div className="chat-header">
                          <div
                            className="avatar large"
                            style={{
                              backgroundImage: `url(${activeFriend.avatar || ''})`,
                              backgroundColor: '#444',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                          <div>
                            <h3>{activeFriend.name || 'Unnamed'}</h3>
                            <p>Friend</p>
                          </div>
                        </div>


                        <div className={`chat-body ${isKeyboardOpen ? 'keyboard-open' : ''}`} ref={chatBodyRef}>
                          {messages.map(msg => (

                            <div
                              key={msg.id}
                              className={`message ${msg.sender === currentUser.uid ? 'user' : 'bot'}`}
                              style={{
                                maxWidth: '600px',
                              }}
                            >
                              {msg.text}
                            </div>
                          ))}
                          {isFriendTyping && (
                            <div className="typing-indicator">
                              {activeFriend?.name || 'Friend'} is typing...
                            </div>
                          )}
                        </div>

                        <div className="chat-input">
                          <input
                            placeholder="Send your message..."
                            value={inputMessage}
                            onChange={(e) => {
                              setInputMessage(e.target.value);
                              HandleTyping();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && inputMessage.trim()) {
                                sendMessage(
                                  [currentUser.uid, activeFriend.uid].sort().join('_'),
                                  inputMessage,
                                  currentUser.uid
                                );
                              }
                            }}
                          />

                          <button
                            onClick={() =>
                              sendMessage(
                                [currentUser.uid, activeFriend.uid].sort().join('_'),
                                inputMessage,
                                currentUser.uid
                              )
                            }
                            disabled={!inputMessage.trim()}
                            className="send-btn"
                          >
                            <Send size={18} />
                          </button>

                        </div>
                      </>
                    ) : (
                      <div className="empty-chat">
                        <p>Select a friend to start chatting</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

    );
  };

  export default ChatUI;
