import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export const useMessages = (currentUser, activeFriend) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!currentUser || !activeFriend) return;

    const threadId = [currentUser.uid, activeFriend.uid].sort().join('_');
    const messagesRef = collection(db, 'threads', threadId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser, activeFriend]);

  return messages;
};
