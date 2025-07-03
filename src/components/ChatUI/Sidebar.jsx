// components/ChatUI/Sidebar.jsx
import React from 'react';
import { Settings, MessageCircle, Users, FileText, Zap } from 'react-feather';

const Sidebar = ({ toggleSettings, setRoomTab }) => (
  <div className="sidebar">
    <div className="icon settings" onClick={toggleSettings}><Settings size={20} /></div>
    <div className="menu-icons">
      <div className="icon" onClick={() => setRoomTab(false)}><MessageCircle size={20} /></div>
      <div className="icon" onClick={() => setRoomTab(true)}><Users size={20} /></div>
      <div className="icon"><FileText size={20} /></div>
    </div>
    <div className="icon logo"><Zap size={20} /></div>
  </div>
);

export default Sidebar;
