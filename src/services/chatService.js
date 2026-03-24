import { db } from '../firebase';
import { collection, query, where, orderBy, limitToLast, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const getMessages = (bandId, entityType, entityId, callback, limitCount = 50) => {
    const path = `bands/${bandId}/messages`;
    const q = query(
        collection(db, path),
        where("entityType", "==", entityType),
        where("entityId", "==", entityId),
        orderBy("createdAt", "asc"),
        limitToLast(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(msgs);
    });
};

export const sendMessage = async (bandId, messageData) => {
    const path = `bands/${bandId}/messages`;
    return await addDoc(collection(db, path), {
        ...messageData,
        createdAt: serverTimestamp()
    });
};
