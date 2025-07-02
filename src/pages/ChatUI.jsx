import React, { useRef, useEffect, useState } from 'react';
import '../style/ChatUI.css';
import { Settings, MessageCircle, Users, FileText, Zap, Send } from 'react-feather';
import { doc, getDoc, setDoc, updateDoc, deleteField, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import YourQR from '../components/YourQR';
import QRScanner from '../components/QRScanner';
import Setting from '../pages/Setting';

const ChatUI = () => {
  const { currentUser } = useAuth();
  const chatBodyRef = useRef(null);
  const typingTimeout = useRef(null);
  const windowHeightRef = useRef(window.innerHeight);
  const [destructOn, setDestructOn] = useState(false);
  const [destructTime, setDestructTime] = useState(5000); // default 5s
  const [fadingMessageIds, setFadingMessageIds] = useState([]);
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
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const toggleSettings = () => setShowSettings(prev => !prev);

  //destruction message
  const sendDmessage = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, 'threads', threadId, 'messages'), {
      text: message,
      senderId: currentUser.uid,
      timestamp: Date.now(),
      destroyAfter: destructOn ? destructTime : null
    });

    setMessage('');
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

  useEffect(() => {
    if (!currentUser) return;

    const receivedRef = doc(db, 'users', currentUser.uid, 'friendRequests', 'received');
    const unsubscribe = onSnapshot(receivedRef, (docSnap) => {
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

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const friendsRef = collection(db, 'users', currentUser.uid, 'friends');
    const unsubscribe = onSnapshot(friendsRef, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push(doc.data()));
      setFriends(list);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !activeFriend) return;

    const threadId = [currentUser.uid, activeFriend.uid].sort().join('_');
    const messagesRef = collection(db, 'threads', threadId, 'messages');
    const q = query(collection(db, 'threads', threadId, 'messages'), orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();

      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        const destroyTime = data.destroyAfter;

        // Schedule local auto-remove if destroyAfter is in the future
        if (destroyTime && destroyTime > now) {
          const timeout = destroyTime - now;
          setTimeout(() => {
            setFadingMessageIds(prev => [...prev, doc.id]);

            setTimeout(() => {
              setMessages(prev => prev.filter(m => m.id !== doc.id));
              setFadingMessageIds(prev => prev.filter(id => id !== doc.id));
            }, 400); // Wait for animation duration (adjust if needed)
          }, timeout);
        }

        return { id: doc.id, ...data };
      });

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser, activeFriend]);

  useEffect(() => {
    if (!currentUser || !activeFriend) return;

    const typingRef = doc(db, 'threads', [currentUser.uid, activeFriend.uid].sort().join('_') + '_typing');

    const unsubscribe = onSnapshot(typingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsFriendTyping(data[activeFriend.uid] === true);
      } else {
        setIsFriendTyping(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser, activeFriend]);

  const HandleTyping = async () => {
    if (!activeFriend || !currentUser) return;

    const threadId = [currentUser.uid, activeFriend.uid].sort().join('_');
    const typingRef = doc(db, 'threads', threadId + '_typing');

    const now = Date.now();
    if (!typingTimeout.current) typingTimeout.current = {};

    typingTimeout.current.lastTyped = now;

    try {
      await setDoc(typingRef, { [currentUser.uid]: true }, { merge: true });

      setTimeout(() => {
        const timeSinceLastTyped = Date.now() - typingTimeout.current.lastTyped;
        if (timeSinceLastTyped >= 1000) {
          setDoc(typingRef, { [currentUser.uid]: false }, { merge: true });
        }
      }, 1100);
    } catch (err) {
      console.error("Typing update failed", err);
    }
  };

  useEffect(() => {
    if (!isFriendTyping || !chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [isFriendTyping]);

  const sendFriendRequest = async (uid) => {
    if (!uid || uid === currentUser?.uid) {
      alert("Invalid UID or can't send request to yourself.");
      return;
    }

    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) {
        alert("User not found.");
        return;
      }

      await setDoc(doc(db, 'users', currentUser.uid, 'friendRequests', 'sent'), { [uid]: true }, { merge: true });
      await setDoc(doc(db, 'users', uid, 'friendRequests', 'received'), { [currentUser.uid]: true }, { merge: true });

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

      const friendName = `${friendData.firstName || ''} ${friendData.lastName || ''}`.trim() || friendData.displayName || 'Unnamed';
      const friendAvatar = friendData.avatar || friendData.photoURL || '';
      const myName = `${currentData.firstName || ''} ${currentData.lastName || ''}`.trim() || currentUser.displayName || 'Unnamed';
      const myAvatar = currentData.avatar || currentUser.photoURL || '';

      await updateDoc(doc(db, 'users', currentUser.uid, 'friendRequests', 'received'), {
        [uid]: deleteField()
      });
      await updateDoc(doc(db, 'users', uid, 'friendRequests', 'sent'), {
        [currentUser.uid]: deleteField()
      });

      await setDoc(doc(db, 'users', currentUser.uid, 'friends', uid), {
        uid, name: friendName, avatar: friendAvatar, createdAt: new Date()
      });

      await setDoc(doc(db, 'users', uid, 'friends', currentUser.uid), {
        uid: currentUser.uid, name: myName, avatar: myAvatar, createdAt: new Date()
      });

      await setDoc(doc(db, 'threads', [currentUser.uid, uid].sort().join('_')), {
        participants: [currentUser.uid, uid], createdAt: new Date()
      });
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  /*const handleReject = async (uid) => {
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
  };*/

  const sendMessage = async (threadId, text, senderUid) => {
    if (!text.trim()) return;

    try {
      const messageData = {
        text,
        sender: senderUid,
        timestamp: serverTimestamp(),
      };

      // Add destruct flag and timer if enabled
      if (destructOn) {
        messageData.destroyAfter = Date.now() + destructTime;
      }

      await addDoc(collection(db, "threads", threadId, "messages"), messageData);
      setInputMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };


  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        setIsKeyboardOpen(heightDiff > 150);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!chatBodyRef.current) return;

    // Wait a tick for the DOM to fully render the new messages
    const timeout = setTimeout(() => {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, 100); // small delay helps after chat switch

    return () => clearTimeout(timeout);
  }, [messages, activeFriend]);




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
              }}>
                + New conversation
                <div class="icon">
                  <svg
                    height="24"
                    width="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </button>

            </div>
          )}
          {/* Chat Window */}
          {(!isMobileView || mobileChatOpen) && (
            <div className={`chat-window ${isMobileView ? 'mobile-active' : ''} ${isKeyboardOpen ? 'keyboard-open' : ''}`}>

              <div class="styled-wrapper">
                <button className="button" onClick={() => {
                  setMobileChatOpen(false);
                  setIsNewConversation(false);
                  setActiveFriend(null);
                }}>
                  <div class="button-box">
                    <span class="button-elem">
                      <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        class="arrow-icon"
                      >
                        <path
                          fill="white"
                          d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                        ></path>
                      </svg>
                    </span>
                    <span class="button-elem">
                      <svg
                        fill="white"
                        viewBox="0 0  24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        class="arrow-icon"
                      >
                        <path
                          d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                        ></path>
                      </svg>
                    </span>
                  </div>
                </button>
              </div>

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
                            <div className="accept-btn" onClick={() => handleAccept(uid)}>
                              <div tabindex="0" class="plusButton">
                                <svg class="plusIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                                  <g mask="url(#mask0_21_345)">
                                    <path d="M13.75 23.75V16.25H6.25V13.75H13.75V6.25H16.25V13.75H23.75V16.25H16.25V23.75H13.75Z"></path>
                                  </g>
                                </svg>
                              </div>
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
                            className={`message ${msg.sender === currentUser.uid ? 'user' : 'bot'} ${fadingMessageIds.includes(msg.id) ? 'burst' : ''}`}
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
                        {/* 💣 Toggle Button */}
                        <button
                          className={`destruct-toggle ${destructOn ? 'active' : ''}`}
                          onClick={() => setDestructOn(prev => !prev)}
                          title="Toggle self-destruct"
                        >
                          💣
                        </button>

                        {/* Optional Destruct Timer */}
                        {destructOn && (
                          <select
                            value={destructTime}
                            onChange={(e) => setDestructTime(Number(e.target.value))}
                            className="destruct-timer"
                          >
                            <option value={3000}>3s</option>
                            <option value={5000}>5s</option>
                            <option value={10000}>10s</option>
                            <option value={30000}>30s</option>
                          </select>
                        )}

                        {/* Message Input */}
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

                        {/* Send Button */}
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
