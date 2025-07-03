import React, { useState } from 'react';

const GroupConnectUI = ({ currentUser, createGroup, joinGroupById }) => {
  const [groupName, setGroupName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [generatedGroupId, setGeneratedGroupId] = useState('');

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    const newGroupId = await createGroup(groupName);
    setGeneratedGroupId(newGroupId);
    setGroupName('');
  };

  const handleJoinGroup = () => {
    if (!joinId.trim()) {
      alert("Please enter a valid group ID.");
      return;
    }

    joinGroupById(joinId);
    setJoinId('');
  };

  return (
    <div className="group-connect-ui">
      <div className="group-section">
        <h3>Create Group</h3>
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button onClick={handleCreateGroup}>Create</button>

        {generatedGroupId && (
          <div className="group-id-box">
            <p><strong>Group ID:</strong> {generatedGroupId}</p>
            <p>Share this with others to join.</p>
          </div>
        )}
      </div>

      <hr style={{ margin: '30px 0', borderColor: '#444' }} />

      <div className="group-section">
        <h3>Join Existing Group</h3>
        <input
          type="text"
          placeholder="Enter Group ID"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
        />
        <button onClick={handleJoinGroup}>Join</button>
      </div>
    </div>
  );
};

export default GroupConnectUI;
