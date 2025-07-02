import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useFriendsList = (currentUser) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const friendsColRef = collection(db, 'users', currentUser.uid, 'friends');
    const unsubscribe = onSnapshot(friendsColRef, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push(doc.data()));
      setFriends(list);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return friends;
};
