import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import search from '../assets/search.gif';

function ProfileNav() {
  const { currentUser } = useAuth();
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchUserFirstName = async () => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || '');  // fallback if undefined
        }
      }
    };
    fetchUserFirstName();
  }, [currentUser]);

  return (
    <>
      <div className="left">
        <p>Hello!!!!</p>
        <h1>{firstName}</h1>
      </div>
      <div className="right">
        <ul>
          <li className="search-container">
            <img src={search} alt="Search" />
            <input type="text" placeholder="Search..." className="search-input" />
          </li>
          <li><img src="https://img.icons8.com/?size=100&id=21618&format=png&color=000000" alt="" id='settings' /></li>
        </ul>
      </div>
    </>
  );
}

export default ProfileNav;
