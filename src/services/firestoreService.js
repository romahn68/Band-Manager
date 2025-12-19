import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, setDoc, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// ... (previous functions remain the same)

// --- CHAT / MESSAGES ---
export const getMessages = (bandId, entityType, entityId, callback) => {
    // entityType can be 'general', 'song', 'gig'
    const path = `bands/${bandId}/messages`;
    const q = query(
        collection(db, path),
        where("entityType", "==", entityType),
        where("entityId", "==", entityId),
        orderBy("createdAt", "asc")
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

// --- BANDS ---
export const getBand = async (bandId) => {
    const docRef = doc(db, "bands", bandId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

export const getBandsByUser = async (uid) => {
    const q = query(collection(db, "bands"), where("ownerId", "==", uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createBand = async (user) => {
    const bandData = {
        nombre: "Mi Nueva Banda",
        ownerId: user.uid,
        createdAt: new Date().toISOString()
    };
    const bandRef = await addDoc(collection(db, "bands"), bandData);
    return bandRef.id;
};

export const updateBand = async (bandId, data) => {
    const bandRef = doc(db, "bands", bandId);
    await updateDoc(bandRef, data);
};

export const updateBandMetadata = async (bandId, metadata) => {
    const bandRef = doc(db, "bands", bandId);
    await updateDoc(bandRef, { metadata: metadata });
};


// --- GENERIC CRUD HELPER ---
const getCollection = async (coll, bandId) => {
    if (!bandId) return [];
    const q = query(collection(db, "bands", bandId, coll));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const addItem = async (coll, bandId, item) => {
    if (!bandId) throw new Error("No band selected");
    const docRef = await addDoc(collection(db, "bands", bandId, coll), item);
    return docRef.id;
};

const updateItem = async (coll, bandId, itemId, data) => {
    const itemRef = doc(db, "bands", bandId, coll, itemId);
    await updateDoc(itemRef, data);
};

const deleteItem = async (coll, bandId, itemId) => {
    const itemRef = doc(db, "bands", bandId, coll, itemId);
    await deleteDoc(itemRef);
};

// --- SPECIFIC EXPORTS ---
export const getSongs = (bandId) => getCollection('songs', bandId);
export const addSong = (bandId, song) => addItem('songs', bandId, song);
export const updateSong = (bandId, id, data) => updateItem('songs', bandId, id, data);
export const deleteSong = (bandId, id) => deleteItem('songs', bandId, id);

export const getMembers = (bandId) => getCollection('members', bandId);
export const addMember = (bandId, member) => addItem('members', bandId, member);
export const updateMember = (bandId, id, data) => updateItem('members', bandId, id, data);
export const deleteMember = (bandId, id) => deleteItem('members', bandId, id);

export const getRehearsals = (bandId) => getCollection('rehearsals', bandId);
export const addRehearsal = (bandId, log) => addItem('rehearsals', bandId, log);
export const updateRehearsal = (bandId, id, data) => updateItem('rehearsals', bandId, id, data);
export const deleteRehearsal = (bandId, id) => deleteItem('rehearsals', bandId, id);

export const getGigs = (bandId) => getCollection('gigs', bandId);
export const addGig = (bandId, gig) => addItem('gigs', bandId, gig);
export const updateGig = (bandId, id, data) => updateItem('gigs', bandId, id, data);
export const deleteGig = (bandId, id) => deleteItem('gigs', bandId, id);

export const getGear = (bandId) => getCollection('gear', bandId);
export const addGear = (bandId, item) => addItem('gear', bandId, item);
export const updateGear = (bandId, id, data) => updateItem('gear', bandId, id, data);
export const deleteGear = (bandId, id) => deleteItem('gear', bandId, id);

export const getFinances = (bandId) => getCollection('finances', bandId);
export const addFinance = (bandId, record) => addItem('finances', bandId, record);
export const updateFinance = (bandId, id, data) => updateItem('finances', bandId, id, data);
export const deleteFinance = (bandId, id) => deleteItem('finances', bandId, id);

