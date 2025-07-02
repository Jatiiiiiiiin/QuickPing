import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useTypingStatus = (currentUser, activeFriend) => {
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  useEffect(() => {
  if (!currentUser || !activeFriend) return;

  const threadId = [currentUser.uid, activeFriend.uid].sort().join('_');
  const typingRef = doc(db, 'threads', `${threadId}_typing`);

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


  return isFriendTyping;
};
