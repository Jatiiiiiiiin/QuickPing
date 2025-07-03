import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/ChatUI.css';
import { doc, getDoc, setDoc, updateDoc, deleteField, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Setting from '../pages/Setting';
import Sidebar from '../components/ChatUI/Sidebar';
import ConversationList from '../components/ChatUI/ConversationList';
import ChatWindow from '../components/ChatUI/ChatWindow';
import { v4 as uuidv4 } from 'uuid';
import FriendConnectUI from '../components/ChatUI/FriendConnectUI';
import GroupConnectUI from '../components/GroupConnectUI';

const ChatUI = () => {
  const { currentUser } = useAuth();
  const chatBodyRef = useRef(null);
  const typingTimeout = useRef(null);
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
  const [groupChats, setGroupChats] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);


  const createGroup = async (name) => {
    const id = uuidv4();// groupid create krne le liye
    try {
      await setDoc(doc(db, 'groups', id), {
        name,
        members: [currentUser.uid],
        createdAt: serverTimestamp()//database me specific time jab bana group
      });
      return id;
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
      return '';
    }
  };

  // Join existing group
  const joinGroupById = async (id) => {
    try {
      const groupRef = doc(db, 'groups', id);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        alert("Group not found.");
        return;
      }

      const groupData = groupSnap.data();
      if (groupData.members.includes(currentUser.uid)) {
        alert("You're already a member of this group.");
        return;
      }

      await updateDoc(groupRef, {
        members: [...groupData.members, currentUser.uid],
      });

      alert("Joined group successfully!");
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join group.");
    }
  };

  //group chat
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'groups'), where('members', 'array-contains', currentUser.uid));//database me group ki info
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Groups fetched:", groups);
      setGroupChats(groups);
    });

    return () => unsubscribe();
  }, [currentUser]);


  useEffect(() => {
    if (!currentUser || !activeGroup) return;// agar na user exist krta na group to return kkrdo
    const q = query(collection(db, 'groups', activeGroup.id, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);// message send krne ko like freind ui
    });

    return () => unsubscribe();
  }, [currentUser, activeGroup]);

  const sendMessage = async (threadId, text, senderUid, isGroup = false) => {
    if (!text.trim()) return;

    try {
      const messageData = {
        text,
        sender: senderUid,
        timestamp: serverTimestamp(),
      };

      if (isGroup) {
        const currentSnap = await getDoc(doc(db, 'users', senderUid));
        const currentData = currentSnap.exists() ? currentSnap.data() : {};

        const name = `${currentData.firstName || ''} ${currentData.lastName || ''}`.trim() || currentData.displayName || 'Unnamed';
        messageData.senderName = name;
      }

      if (destructOn) {
        messageData.destroyAfter = Date.now() + destructTime;// destruction logic for deleating only selected messages
      }

      const colRef = isGroup
        ? collection(db, 'groups', threadId, 'messages')
        : collection(db, 'threads', threadId, 'messages');

      await addDoc(colRef, messageData);
      setInputMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
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
  }, [messages]); //taki last me send hua message hi hamesha screen pe dikhe

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
            }, 400); // Wait for animation duration
          }, timeout);
        }

        return { id: doc.id, ...data };
      });

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser, activeFriend]);

// typing logic hai jab samne vala type krra hoga to user ko show hoga

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
  useEffect(() => {
    if (!isFriendTyping || !chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [isFriendTyping]);


  //freind rewuest send krne ke liye
  const sendFriendRequest = async (uid) => {
    if (!uid || uid === currentUser?.uid) { //agarr galat uid hai ya same uid hai to invalid show krega
      alert("Invalid UID or can't send request to yourself.");
      return;
    }
    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) { //get doc se docs me jake user ki uid check karega .exist kregi to ok nai to error
        alert("User not found.");
        return;
      }
      await setDoc(doc(db, 'users', currentUser.uid, 'friendRequests', 'sent'), { [uid]: true }, { merge: true });
      await setDoc(doc(db, 'users', uid, 'friendRequests', 'received'), { [currentUser.uid]: true }, { merge: true });
      alert("Friend request sent!");  //reques send or recieve idhar se hogi
      setManualUID('');
    } catch (error) {
      console.error("Friend request error:", error);
      alert("Error sending request.");
    }
  };

  //request accept krke database me to add krega ki under friends corner pr tumahre conversation-list me bhi show hoga

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

    const timeout = setTimeout(() => {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages, activeFriend]);

  return (
    <div className="chat-container">
      <Sidebar toggleSettings={toggleSettings} />


      {showSettings ? (
        <Setting />
      ) : (
        <>
          {/* Conversation List */}
          {(!isMobileView || !mobileChatOpen) && (
            <ConversationList
              friends={friends}
              groupChats={groupChats} 
              setActiveFriend={setActiveFriend}
              setActiveGroup={setActiveGroup}
              isMobileView={isMobileView}
              setMobileChatOpen={setMobileChatOpen}
              setIsNewConversation={setIsNewConversation}
            />

          )}

          {(!isMobileView || mobileChatOpen) && (

            <div className={`chat-window ${isMobileView ? 'mobile-active' : ''} ${isKeyboardOpen ? 'keyboard-open' : ''}`}>

              <div class="styled-wrapper">
                <button className="button" onClick={() => {
                  setMobileChatOpen(false);
                  setIsNewConversation(false);
                  setActiveFriend(null);
                  setActiveGroup(null);
                  setActiveTab('connect');
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
                activeTab === 'groups' ? (
                  <GroupConnectUI
                    currentUser={currentUser}
                    createGroup={createGroup}
                    joinGroupById={joinGroupById}
                  />
                ) : (
                  <FriendConnectUI
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    scannedUID={scannedUID}
                    setScannedUID={setScannedUID}
                    manualUID={manualUID}
                    setManualUID={setManualUID}
                    sendFriendRequest={sendFriendRequest}
                    receivedRequests={receivedRequests}
                    handleAccept={handleAccept}
                    currentUser={currentUser} 
                    createGroup={createGroup}
                    joinGroupById={joinGroupById}
                  />

                )
              ) : (
                <>
                  {(activeFriend || activeGroup) && (
                    <ChatWindow
                      chatType={activeGroup ? "group" : "private"}
                      threadId={activeGroup ? activeGroup.id : [currentUser.uid, activeFriend.uid].sort().join('_')}
                      currentUser={currentUser}
                      activeFriend={activeFriend}
                      activeGroup={activeGroup}
                      inputMessage={inputMessage}
                      setInputMessage={setInputMessage}
                      HandleTyping={HandleTyping}
                      messages={messages}
                      isFriendTyping={isFriendTyping}
                      chatBodyRef={chatBodyRef}
                      sendMessage={sendMessage}
                      fadingMessageIds={fadingMessageIds}
                      destructOn={destructOn}
                      destructTime={destructTime}
                      setDestructTime={setDestructTime}
                      setDestructOn={setDestructOn}
                    />

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
