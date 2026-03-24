import { db } from '../firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, getCountFromServer, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const getCollectionCount = async (coll, bandId) => {
    if (!bandId) return 0;
    const collRef = collection(db, "bands", bandId, coll);
    const snapshot = await getCountFromServer(collRef);
    return snapshot.data().count;
};

export const getCollection = async (coll, bandId, limitCount = 100) => {
    if (!bandId) return [];
    const q = query(collection(db, "bands", bandId, coll), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPaginatedCollection = async (coll, bandId, pageSize = 20, lastDoc = null) => {
    if (!bandId) return { data: [], lastDoc: null };
    let q = query(
        collection(db, "bands", bandId, coll),
        orderBy("createdAt", "desc"),
        limit(pageSize)
    );

    if (lastDoc) {
        q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { data, lastDoc: lastVisible };
};

export const updateItem = async (coll, bandId, itemId, data) => {
    const itemRef = doc(db, "bands", bandId, coll, itemId);
    await updateDoc(itemRef, data);
};

export const deleteItem = async (coll, bandId, itemId) => {
    const itemRef = doc(db, "bands", bandId, coll, itemId);
    await deleteDoc(itemRef);
};
