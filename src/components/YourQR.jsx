import React from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '../context/AuthContext';

function YourQR() {
  const { currentUser } = useAuth();

  if (!currentUser || !currentUser.uid) {
    return <p>Loading...</p>;
  }

  return (
    <div className="qr-section" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px' }}>
      <p className='qr'>Scan this to connect:</p>
      <QRCode 
        value={currentUser.uid} 
        size={180} 
        bgColor="#FFFFFF" 
        fgColor="#000000" 
      />
      <p className='qr'>{currentUser.uid}</p>
    </div>
  );
}

export default YourQR;
