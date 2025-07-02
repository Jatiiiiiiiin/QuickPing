import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useFriendRequests = (currentUser) => {
  const [receivedRequests, setReceivedRequests] = useState([]);

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

  return receivedRequests;
};
