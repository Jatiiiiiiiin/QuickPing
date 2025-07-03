// src/components/ChatWindow.jsx
import React, { useEffect, useState } from 'react';
import { Send } from 'react-feather';

const ChatWindow = ({
  currentUser,
  activeFriend,
  activeGroup, // ✅ FIXED: renamed from activeRoom
  inputMessage,
  setInputMessage,
  HandleTyping,
  messages,
  isFriendTyping,
  chatBodyRef,
  sendMessage,
  fadingMessageIds,
  destructOn,
  destructTime,
  setDestructTime,
  setDestructOn,
}) => {
  const threadId = activeGroup
    ? activeGroup.id // ✅ Group ID used directly
    : [currentUser.uid, activeFriend?.uid].sort().join('_');

  const getColorForUID = (uid) => {
    const colors = [
      "#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D",
      "#845EC2", "#00C9A7", "#F9A826", "#FF9671",
      "#0081CF", "#D65DB1", "#FFC75F", "#FF6F91"
    ];

    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const [animateBody, setAnimateBody] = useState(false);

  useEffect(() => {
    if (activeFriend || activeGroup) {
      setAnimateBody(false); // Reset
      requestAnimationFrame(() => {
        setAnimateBody(true); // Trigger
      });
    }
  }, [activeFriend, activeGroup]);


  return (
    <>
      {activeFriend || activeGroup ? (
        <>
          <div className="chat-header">
            <div
              className="avatar large"
              style={{
                backgroundImage: `url(${activeFriend?.avatar || ''})`,
                backgroundColor: '#444',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div>
              <h3>{activeGroup?.name || activeFriend?.name || 'Unnamed'}</h3>
              <p>{activeGroup ? 'Group Chat' : 'Friend'}</p>
              {activeGroup && (
                <p style={{ fontSize: '12px', color: '#ccc' }}>
                  Group Code: <code>{activeGroup.id}</code>
                </p>
              )}
            </div>
          </div>

          <div className={`chat-body ${animateBody ? 'animate' : ''}`} ref={chatBodyRef}>
            {messages.map(msg => {
              const isUser = msg.sender === currentUser.uid;
              const isFading = fadingMessageIds.includes(msg.id);

              // Show name & color only for group messages
              const showName = activeGroup && !isUser;
              const senderName = msg.senderName || 'Unknown';
              const senderColor = getColorForUID(msg.sender);

              return (
                <div
                  key={msg.id}
                  className={`message ${isUser ? 'user' : 'bot'} ${isFading ? 'burst' : ''}`}
                  style={{ maxWidth: '600px' }}
                >
                  {showName && (
                    <div
                      className="sender-name"
                      style={{
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        marginBottom: '3px',
                        color: senderColor,
                      }}
                    >
                      {senderName}
                    </div>
                  )}
                  {msg.text}
                </div>
              );
            })}
            {isFriendTyping && !activeGroup && (
              <div className="typing-indicator">
                {activeFriend?.name || 'Friend'} is typing...
              </div>
            )}
          </div>

          <div className="chat-input">
            <button
              className={`destruct-toggle ${destructOn ? 'active' : ''}`}
              onClick={() => setDestructOn(prev => !prev)}
              title="Toggle self-destruct"
            >
              💣
            </button>

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

            <input
              placeholder="Send your message..."
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                HandleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputMessage.trim()) {
                  sendMessage(threadId, inputMessage, currentUser.uid, !!activeGroup);
                }
              }}
            />

            <button
              onClick={() => sendMessage(threadId, inputMessage, currentUser.uid, !!activeGroup)}
              disabled={!inputMessage.trim()}
              className="send-btn"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="empty-chat">
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
