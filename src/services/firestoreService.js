import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, orderBy, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { generateIdCode } from '../utils/codeGenerator';

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
    const q = query(collection(db, "bands"), where("members", "array-contains", uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createBand = async (user, bandName = "Mi Nueva Banda") => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bandData = {
        nombre: bandName,
        ownerId: user.uid,
        inviteCode: inviteCode,
        customId: generateIdCode('band'),
        createdAt: new Date().toISOString(),
        members: [user.uid],
        admins: [user.uid]
    };
    const bandRef = await addDoc(collection(db, "bands"), bandData);

    await addDoc(collection(db, "bands", bandRef.id, "musicians"), {
        uid: user.uid,
        email: user.email,
        nombre: user.displayName || 'Usuario',
        role: 'Admin',
        customId: generateIdCode('member'),
        instrument: {
            id: generateIdCode('instrument'),
            nombre: 'Voz / Director'
        },
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bandId: bandRef.id
    });

    return { id: bandRef.id, ...bandData };
};

export const updateBand = async (bandId, data) => {
    const bandRef = doc(db, "bands", bandId);
    await updateDoc(bandRef, data);
};

export const updateBandMetadata = updateBand;

// --- MEMBERS / JOINING ---
export const getBandByInviteCode = async (inviteCode) => {
    const q = query(collection(db, "bands"), where("inviteCode", "==", inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
};

export const joinBand = async (bandId, user, role = 'Miembro') => {
    const bandRef = doc(db, "bands", bandId);
    const bandSnap = await getDoc(bandRef);
    if (!bandSnap.exists()) throw new Error("La banda no existe");

    const bandData = bandSnap.data();
    if (bandData.members.includes(user.uid)) return;

    await updateDoc(bandRef, {
        members: [...bandData.members, user.uid]
    });

    await addDoc(collection(db, "bands", bandId, "musicians"), {
        uid: user.uid,
        email: user.email,
        nombre: user.displayName || 'Músico',
        role: role,
        customId: generateIdCode('member'),
        instrument: {
            id: generateIdCode('instrument'),
            nombre: 'Por definir'
        },
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bandId: bandId
    });
};

// --- CHAT / MESSAGES ---
export const getMessages = (bandId, entityType, entityId, callback) => {
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

// --- GENERIC CRUD HELPERS ---
const getCollection = async (coll, bandId) => {
    if (!bandId) return [];
    const q = query(collection(db, "bands", bandId, coll));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const addItem = async (coll, bandId, item) => {
    if (!bandId) {
        console.error(`Attempted to add item to ${coll} without bandId`, item);
        throw new Error("No band selected");
    }

    const typeMap = { 'songs': 'song', 'gear': 'gear', 'musicians': 'member', 'instruments': 'instrument' };
    const entityType = typeMap[coll] || 'other';

    // Pro-structuring: Ensure core properties exist
    const structuredItem = {
        ...item,
        customId: item.customId || generateIdCode(entityType),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bandId: bandId
    };

    try {
        const docRef = await addDoc(collection(db, "bands", bandId, coll), structuredItem);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding item to ${coll}:`, error);
        throw error;
    }
};

const updateItem = async (coll, bandId, itemId, data) => {
    const itemRef = doc(db, "bands", bandId, coll, itemId);
    await updateDoc(itemRef, data);
};

const deleteItem = async (coll, bandId, itemId) => {
    const itemRef = doc(db, "bands", bandId, coll, itemId);
    await deleteDoc(itemRef);
};

// --- BULK OPERATIONS ---
const bulkAddItems = async (coll, bandId, items) => {
    if (!bandId || !items.length) return;
    const batch = writeBatch(db);
    const collRef = collection(db, "bands", bandId, coll);

    const typeMap = { 'songs': 'song', 'gear': 'gear', 'musicians': 'member', 'instruments': 'instrument' };
    const entityType = typeMap[coll] || 'other';

    items.forEach(item => {
        const docRef = doc(collRef);
        batch.set(docRef, {
            ...item,
            customId: item.customId || generateIdCode(entityType),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            bandId: bandId
        });
    });

    await batch.commit();
};

// --- SPECIFIC EXPORTS ---
export const getSongs = (bandId) => getCollection('songs', bandId);
export const addSong = (bandId, song) => addItem('songs', bandId, song);
export const updateSong = (bandId, id, data) => updateItem('songs', bandId, id, data);
export const deleteSong = (bandId, id) => deleteItem('songs', bandId, id);
export const bulkAddSongs = (bandId, songs) => bulkAddItems('songs', bandId, songs);

export const getMusicians = (bandId) => getCollection('musicians', bandId);
export const addMusician = (bandId, musician) => addItem('musicians', bandId, musician);
export const updateMusician = (bandId, id, data) => updateItem('musicians', bandId, id, data);
export const deleteMusician = (bandId, id) => deleteItem('musicians', bandId, id);

// Aliases for compatibility
export const getMembers = getMusicians;
export const addMember = addMusician;
export const updateMember = updateMusician;
export const deleteMember = deleteMusician;

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
export const bulkAddGear = (bandId, gear) => bulkAddItems('gear', bandId, gear);

export const getFinances = (bandId) => getCollection('finances', bandId);
export const addFinance = (bandId, record) => addItem('finances', bandId, record);
export const updateFinance = (bandId, id, data) => updateItem('finances', bandId, id, data);
export const deleteFinance = (bandId, id) => deleteItem('finances', bandId, id);

export const inviteUserToBand = async (bandId, email) => {
    const invRef = collection(db, "bands", bandId, "invitations");
    await addDoc(invRef, {
        email: email,
        invitedAt: serverTimestamp(),
        status: 'pending'
    });
};

export const updateUserProfile = async (uid, data) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
};
