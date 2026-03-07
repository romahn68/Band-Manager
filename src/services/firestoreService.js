import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, orderBy, onSnapshot, serverTimestamp, writeBatch, limit, limitToLast, startAfter, setDoc, getCountFromServer } from 'firebase/firestore';
import { generateIdCode } from '../utils/codeGenerator';
import { ENTITY_TYPES } from '../utils/constants';
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
    const bands = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Orden determinista por fecha de creación para evitar discordancia en bandas por defecto
    return bands.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
};

export const createBand = async (user, bandName = "Mi Nueva Banda") => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bandRef = doc(collection(db, "bands")); // Generate ID first
    const memberRef = doc(db, "bands", bandRef.id, "musicians", user.uid);
    const now = new Date().toISOString();

    const bandData = {
        id: bandRef.id,
        nombre: bandName,
        ownerId: user.uid,
        inviteCode: inviteCode,
        customId: generateIdCode('band'),
        createdAt: now,
        members: [user.uid],
        admins: [user.uid]
    };

    const memberData = {
        uid: user.uid,
        role: 'Admin',
        customId: generateIdCode('member'),
        instrument: {
            id: generateIdCode('instrument'),
            nombre: 'Voz / Director'
        },
        joinedAt: now,
        updatedAt: now,
        bandId: bandRef.id
    };

    const batch = writeBatch(db);
    batch.set(bandRef, bandData);
    batch.set(memberRef, memberData);

    await batch.commit();

    return bandData;
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

    const memberRef = doc(db, "bands", bandId, "musicians", user.uid);
    const now = new Date().toISOString();

    const batch = writeBatch(db);

    batch.update(bandRef, {
        members: [...bandData.members, user.uid]
    });

    batch.set(memberRef, {
        uid: user.uid,
        role: role,
        customId: generateIdCode('member'),
        instrument: {
            id: generateIdCode('instrument'),
            nombre: 'Por definir'
        },
        joinedAt: now,
        updatedAt: now,
        bandId: bandId
    });

    await batch.commit();
};

// --- CHAT / MESSAGES ---
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

// --- GENERIC CRUD HELPERS ---
const getCollectionCount = async (coll, bandId) => {
    if (!bandId) return 0;
    const collRef = collection(db, "bands", bandId, coll);
    const snapshot = await getCountFromServer(collRef);
    return snapshot.data().count;
};

const getCollection = async (coll, bandId, limitCount = 100) => {
    if (!bandId) return [];
    // Added safety limit to prevent massive unpaginated reads
    const q = query(collection(db, "bands", bandId, coll), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getCollectionPaginated = async (coll, bandId, pageSize = 15, lastVisible = null, sortField = 'createdAt', sortDir = 'desc') => {
    if (!bandId) return { data: [], lastVisible: null };

    let q = query(
        collection(db, "bands", bandId, coll),
        orderBy(sortField, sortDir),
        limit(pageSize)
    );

    if (lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const documentSnapshots = await getDocs(q);
    const data = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

    return { data, lastVisible: lastVisibleDoc };
};

const addItem = async (coll, bandId, item) => {
    if (!bandId) {
        console.error(`Attempted to add item to ${coll} without bandId`, item);
        throw new Error("No band selected");
    }

    const entityType = ENTITY_TYPES[coll] || 'other';

    // Generate ID beforehand for structured storage
    const docRef = doc(collection(db, "bands", bandId, coll));
    const now = new Date().toISOString();

    // Pro-structuring: Ensure core properties exist
    const structuredItem = {
        ...item,
        customId: item.customId || generateIdCode(entityType),
        createdAt: item.createdAt || now,
        updatedAt: now,
        bandId: bandId
    };

    try {
        await setDoc(docRef, structuredItem);
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

    const entityType = ENTITY_TYPES[coll] || 'other';
    const now = new Date().toISOString();

    items.forEach(item => {
        const docRef = doc(collRef);

        batch.set(docRef, {
            ...item,
            customId: item.customId || generateIdCode(entityType),
            createdAt: now,
            updatedAt: now,
            bandId: bandId
        });
    });

    await batch.commit();
};

// --- SPECIFIC EXPORTS ---
export const getSongsCount = (bandId) => getCollectionCount('songs', bandId);
export const getMusiciansCount = (bandId) => getCollectionCount('musicians', bandId);
export const getRehearsalsCount = (bandId) => getCollectionCount('rehearsals', bandId);
export const getGigsCount = (bandId) => getCollectionCount('gigs', bandId);

export const getSongs = (bandId) => getCollection('songs', bandId);

export const getSongsPaginated = async (bandId, pageSize = 15, lastVisible = null) => {
    if (!bandId) return { data: [], lastVisible: null };

    let q = query(
        collection(db, "bands", bandId, "songs"),
        orderBy("titulo", "asc"),
        limit(pageSize)
    );

    if (lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const documentSnapshots = await getDocs(q);
    const data = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Save reference to last doc
    const lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

    return { data, lastVisible: lastVisibleDoc };
};

export const addSong = (bandId, song) => addItem('songs', bandId, song);
export const updateSong = (bandId, id, data) => updateItem('songs', bandId, id, data);
export const deleteSong = (bandId, id) => deleteItem('songs', bandId, id);
export const bulkAddSongs = (bandId, songs) => bulkAddItems('songs', bandId, songs);

export const getMusicians = async (bandId) => {
    const musicians = await getCollection('musicians', bandId);
    return Promise.all(musicians.map(async (m) => {
        if (m.uid && !m.nombre) {
            const userSnap = await getDoc(doc(db, "users", m.uid));
            if (userSnap.exists()) {
                const ud = userSnap.data();
                return { ...m, nombre: ud.nombre, email: ud.email, photoURL: ud.photoURL };
            }
        }
        return m;
    }));
};

export const getMusiciansPaginated = async (bandId, pageSize = 15, lastVisible = null) => {
    // Ordenar por joinedAt para no excluir documentos sin nombre
    const result = await getCollectionPaginated('musicians', bandId, pageSize, lastVisible, 'joinedAt', 'asc');
    const enrichedData = await Promise.all(result.data.map(async (m) => {
        if (m.uid && !m.nombre) {
            const userSnap = await getDoc(doc(db, "users", m.uid));
            if (userSnap.exists()) {
                const ud = userSnap.data();
                return { ...m, nombre: ud.nombre, email: ud.email, photoURL: ud.photoURL };
            }
        }
        return m;
    }));
    return { data: enrichedData, lastVisible: result.lastVisible };
};
export const addMusician = (bandId, musician) => addItem('musicians', bandId, musician);
export const updateMusician = (bandId, id, data) => updateItem('musicians', bandId, id, data);
export const deleteMusician = (bandId, id) => deleteItem('musicians', bandId, id);

// Aliases for compatibility
export const getMembers = getMusicians;
export const addMember = addMusician;
export const updateMember = updateMusician;
export const deleteMember = deleteMusician;

export const getRehearsals = (bandId) => getCollection('rehearsals', bandId);
export const getRehearsalsPaginated = (bandId, pageSize = 15, lastVisible = null) =>
    getCollectionPaginated('rehearsals', bandId, pageSize, lastVisible, 'fecha', 'desc');
export const addRehearsal = (bandId, log) => addItem('rehearsals', bandId, log);
export const updateRehearsal = (bandId, id, data) => updateItem('rehearsals', bandId, id, data);
export const deleteRehearsal = (bandId, id) => deleteItem('rehearsals', bandId, id);

export const getGigs = (bandId) => getCollection('gigs', bandId);
export const getUpcomingGigs = async (bandId, limitCount = 1) => {
    if (!bandId) return [];
    const today = new Date().toISOString().split('T')[0];
    const q = query(
        collection(db, "bands", bandId, "gigs"),
        where("fecha", ">=", today),
        orderBy("fecha", "asc"),
        limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getGigsPaginated = async (bandId, pageSize = 10, lastVisible = null) => {
    if (!bandId) return { data: [], lastVisible: null };

    let q = query(
        collection(db, "bands", bandId, "gigs"),
        orderBy("fecha", "desc"), // Show newest/future first usually, but check current usage
        limit(pageSize)
    );

    if (lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const documentSnapshots = await getDocs(q);
    const data = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

    return { data, lastVisible: lastVisibleDoc };
};

export const addGig = (bandId, gig) => addItem('gigs', bandId, gig);
export const updateGig = (bandId, id, data) => updateItem('gigs', bandId, id, data);
export const deleteGig = (bandId, id) => deleteItem('gigs', bandId, id);

export const getGear = (bandId) => getCollection('gear', bandId);
export const getGearPaginated = (bandId, pageSize = 15, lastVisible = null) =>
    getCollectionPaginated('gear', bandId, pageSize, lastVisible, 'name', 'asc');
export const addGear = (bandId, item) => addItem('gear', bandId, item);
export const updateGear = (bandId, id, data) => updateItem('gear', bandId, id, data);
export const deleteGear = (bandId, id) => deleteItem('gear', bandId, id);
export const bulkAddGear = (bandId, gear) => bulkAddItems('gear', bandId, gear);

export const getFinances = (bandId) => getCollection('finances', bandId);
export const getFinancesPaginated = (bandId, pageSize = 15, lastVisible = null) =>
    getCollectionPaginated('finances', bandId, pageSize, lastVisible, 'fecha', 'desc');
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
    // Solo actualizamos el maestro de usuario. Ya no se duplica en las subcolecciones.
    const userRef = doc(db, "users", uid);
    try {
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
