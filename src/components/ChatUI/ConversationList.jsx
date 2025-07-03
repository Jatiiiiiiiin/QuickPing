import React from 'react';

const ConversationList = ({
  friends,
  groupChats,
  setActiveFriend,
  setActiveGroup,
  isMobileView,
  setMobileChatOpen,
  setIsNewConversation,
}) => {
  return (
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
                setActiveGroup(null);
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

        {groupChats?.length > 0 && (
          <div className="group-list">
            <h4 className="section-title">Group Chats</h4>
            {groupChats.map(group => (
              <div
                key={group.id}
                className="conversation"
                onClick={() => {
                  setActiveGroup(group);
                  setActiveFriend(null);
                  if (isMobileView) setMobileChatOpen(true);
                }}
              >
                <div className="avatar" style={{ backgroundColor: '#555' }}>
                  👥
                </div>
                <div className="preview">
                  <p className="title">{group.name}</p>
                  <p className="msg">Click to chat</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="new-convo"
        onClick={() => {
          setIsNewConversation(true);
          setActiveFriend(null);
          setActiveGroup(null);
          if (isMobileView) setMobileChatOpen(true);
        }}
      >
        + New conversation
        <div className="icon">
          <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none"></path>
            <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
  );
};

export default ConversationList;
