import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, orderBy, onSnapshot, serverTimestamp, writeBatch, limit, limitToLast, startAfter, setDoc, getCountFromServer, arrayUnion, arrayRemove } from 'firebase/firestore';
import { generateIdCode } from '../utils/codeGenerator';
import { ENTITY_TYPES, ROLES } from '../utils/constants';
import { 
    createBandModel, 
    createMusicianModel, 
    createSongModel, 
    createGigModel, 
    createRehearsalModel, 
    createFinanceTransactionModel, 
    createGearModel, 
    createGlobalUser,
    createInvitationModel 
} from '../models/DataModels';

const FACTORY_MAP = {
    'songs': createSongModel,
    'gear': createGearModel,
    'musicians': createMusicianModel,
    'rehearsals': createRehearsalModel,
    'gigs': createGigModel,
    'finances': createFinanceTransactionModel,
    'invitations': createInvitationModel
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
    const q = query(collection(db, "bands"), where("members", "array-contains", uid));
    const querySnapshot = await getDocs(q);
    const bands = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Orden determinista por fecha de creación para evitar discordancia en bandas por defecto
    return bands.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
};

export const createBand = async (user, bandName = "Mi Nueva Banda") => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bandRef = doc(collection(db, "bands")); 
    const memberRef = doc(db, "bands", bandRef.id, "musicians", user.uid);
    const now = new Date().toISOString();

    const bandData = createBandModel({
        nombre: bandName,
        ownerId: user.uid,
        inviteCode: inviteCode,
        members: [user.uid],
        admins: [user.uid]
    });

    const memberData = createMusicianModel({
        uid: user.uid,
        role: ROLES.ADMIN,
        instrumentId: generateIdCode('instrument'),
        instrumentName: 'Voz / Director',
        bandId: bandRef.id
    });

    const batch = writeBatch(db);
    batch.set(bandRef, bandData);
    batch.set(memberRef, memberData);

    await batch.commit();

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

export const joinBand = async (bandId, user) => {
    const bandRef = doc(db, "bands", bandId);
    const bandSnap = await getDoc(bandRef);
    if (!bandSnap.exists()) throw new Error("La banda no existe");

    const bandData = bandSnap.data();
    if (bandData.members.includes(user.uid)) return;

    // Buscar invitación por correo
    const inviteRef = doc(db, "bands", bandId, "invitations", user.email.toLowerCase());
    const inviteSnap = await getDoc(inviteRef);
    let inviteData = inviteSnap.exists() ? inviteSnap.data() : null;

    const memberRef = doc(db, "bands", bandId, "musicians", user.uid);
    const now = new Date().toISOString();

    const batch = writeBatch(db);

    batch.update(bandRef, {
        members: arrayUnion(user.uid)
    });

    const memberData = createMusicianModel({
        uid: user.uid,
        role: inviteData?.permisos || ROLES.VISOR,
        profile: inviteData?.perfil || 'Musico',
        instrumentId: generateIdCode('instrument'),
        instrumentName: 'Por definir',
        bandId: bandId
    });

    batch.set(memberRef, memberData);

    // Si hay invitación, consumirla
    if (inviteSnap.exists()) {
        batch.delete(inviteRef);
        
        // Inicializar perfil global si no existe
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            batch.set(userRef, createGlobalUser({
                uid: user.uid,
                email: user.email,
                nombre: `${inviteData.nombre} ${inviteData.apellido}`.trim() || user.displayName,
            }));
        }
    }

    await batch.commit();
};

export const createInvite = async (bandId, inviteData) => {
    // Standardized: Use 'invitations' as the unified subcollection and email as the doc ID
    // (Senior Audit Finding #4)
    const emailKey = inviteData.correo?.toLowerCase() || inviteData.email?.toLowerCase();
    const inviteRef = doc(db, "bands", bandId, "invitations", emailKey);
    
    const structuredInvite = createInvitationModel({
        ...inviteData,
        bandId
    });

    await setDoc(inviteRef, structuredInvite);
};

export const getInviteByEmail = async (bandId, email) => {
    const emailKey = email.toLowerCase();
    const inviteRef = doc(db, "bands", bandId, "invitations", emailKey);
    const inviteSnap = await getDoc(inviteRef);
    if (inviteSnap.exists()) return inviteSnap.data();
    return null;
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

// --- PAGINATION HELPER ---
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

const addItem = async (coll, bandId, item) => {
    if (!bandId) {
        console.error(`Attempted to add item to ${coll} without bandId`, item);
        throw new Error("No band selected");
    }

    const factory = FACTORY_MAP[coll];
    const docRef = doc(collection(db, "bands", bandId, coll));

    const structuredItem = factory ? factory({ ...item, bandId }) : {
        ...item,
        customId: item.customId || generateIdCode(ENTITY_TYPES[coll] || 'other'),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
    try {
        const itemRef = doc(db, "bands", bandId, coll, itemId);
        await updateDoc(itemRef, data);
    } catch (error) {
        console.error(`Error updating item in ${coll}:`, error);
        throw new Error(`No se pudo actualizar el registro en ${coll}.`);
    }
};

const deleteItem = async (coll, bandId, itemId) => {
    try {
        const itemRef = doc(db, "bands", bandId, coll, itemId);
        await deleteDoc(itemRef);
    } catch (error) {
        console.error(`Error deleting item in ${coll}:`, error);
        throw new Error(`No se pudo eliminar el registro de ${coll}.`);
    }
};

// --- BULK OPERATIONS ---
const bulkAddItems = async (coll, bandId, items) => {
    if (!bandId || !items.length) return;
    const batch = writeBatch(db);
    const collRef = collection(db, "bands", bandId, coll);

    const factory = FACTORY_MAP[coll];

    items.forEach(item => {
        const docRef = doc(collRef);

        const structuredItem = factory ? factory({ ...item, bandId }) : {
            ...item,
            customId: item.customId || generateIdCode(ENTITY_TYPES[coll] || 'other'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            bandId: bandId
        };

        batch.set(docRef, structuredItem);
    });

    await batch.commit();
};

// --- SPECIFIC EXPORTS ---
export const getSongsCount = (bandId) => getCollectionCount('songs', bandId);
export const getMusiciansCount = (bandId) => getCollectionCount('musicians', bandId);
export const getRehearsalsCount = (bandId) => getCollectionCount('rehearsals', bandId);
export const getGigsCount = (bandId) => getCollectionCount('gigs', bandId);

export const getSongs = (bandId, pageSize = 50) => getCollection('songs', bandId, pageSize);

export const getSongsPaginated = (bandId, pageSize = 15, lastVisible = null) => 
    getPaginatedCollection('songs', bandId, pageSize, lastVisible);

export const addSong = (bandId, song) => addItem('songs', bandId, song);
export const updateSong = (bandId, id, data) => updateItem('songs', bandId, id, data);
export const deleteSong = (bandId, id) => deleteItem('songs', bandId, id);
export const bulkAddSongs = (bandId, songs) => bulkAddItems('songs', bandId, songs);

export const getMusicians = async (bandId, pageSize = 50) => {
    try {
        const musicians = await getCollection('musicians', bandId, pageSize);
        const uids = [...new Set(musicians.map(m => m.uid).filter(Boolean))];
        
        if (uids.length === 0) return musicians;

        // Firestore 'in' query limit is 30. For simplicity in this project (small bands), 
        // we take the first 30 or we could chunk it if needed.
        const userDocs = [];
        for (let i = 0; i < uids.length; i += 30) {
            const chunk = uids.slice(i, i + 30);
            const userQuery = query(collection(db, "users"), where("uid", "in", chunk));
            const userSnap = await getDocs(userQuery);
            userDocs.push(...userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        const userMap = Object.fromEntries(userDocs.map(u => [u.uid, u]));

        return musicians.map(m => {
            const ud = userMap[m.uid];
            if (ud) {
                return { 
                    ...m, 
                    nombre: ud.nombre || ud.fullName || m.nombre || 'Miembro', 
                    email: ud.email || m.email, 
                    photoURL: ud.photoURL || m.photoURL 
                };
            }
            return m;
        });
    } catch (error) {
        console.error("Error in getMusicians:", error);
        throw error;
    }
};

export const getMusiciansPaginated = async (bandId, pageSize = 15, lastVisible = null) => {
    try {
        const result = await getPaginatedCollection('musicians', bandId, pageSize, lastVisible);
        const uids = [...new Set(result.data.map(m => m.uid).filter(Boolean))];

        if (uids.length === 0) return { data: result.data, lastVisible: result.lastDoc };

        const userDocs = [];
        for (let i = 0; i < uids.length; i += 30) {
            const chunk = uids.slice(i, i + 30);
            const userQuery = query(collection(db, "users"), where("uid", "in", chunk));
            const userSnap = await getDocs(userQuery);
            userDocs.push(...userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        const userMap = Object.fromEntries(userDocs.map(u => [u.uid, u]));

        const enrichedData = result.data.map(m => {
            const ud = userMap[m.uid];
            if (ud) {
                return { 
                    ...m, 
                    nombre: ud.nombre || ud.fullName || m.nombre || 'Miembro', 
                    email: ud.email || m.email, 
                    photoURL: ud.photoURL || m.photoURL 
                };
            }
            return m;
        });
        
        return { data: enrichedData, lastVisible: result.lastDoc };
    } catch (error) {
        console.error("Error in getMusiciansPaginated:", error);
        throw error;
    }
};

export const addMusician = (bandId, musician) => addItem('musicians', bandId, musician);
export const updateMusician = (bandId, id, data) => updateItem('musicians', bandId, id, data);
export const deleteMusician = (bandId, id) => deleteItem('musicians', bandId, id);

export const updateMemberRole = async (bandId, memberUid, newRole) => {
    try {
        const batch = writeBatch(db);
        const bandRef = doc(db, "bands", bandId);
        const memberRef = doc(db, "bands", bandId, "musicians", memberUid);

        batch.update(memberRef, { role: newRole });

        if (newRole === ROLES.ADMIN) {
            batch.update(bandRef, {
                admins: arrayUnion(memberUid)
            });
        } else {
            batch.update(bandRef, {
                admins: arrayRemove(memberUid)
            });
        }

        await batch.commit();
    } catch (error) {
        console.error("Error updating member role:", error);
        throw new Error("No se pudo actualizar el permiso del usuario.");
    }
};

export const getMembers = getMusicians;
export const addMember = addMusician;
export const updateMember = updateMusician;
export const deleteMember = deleteMusician;

export const getRehearsals = (bandId, pageSize = 50) => getCollection('rehearsals', bandId, pageSize);
export const getRehearsalsPaginated = (bandId, pageSize = 15, lastVisible = null) =>
    getPaginatedCollection('rehearsals', bandId, pageSize, lastVisible);

export const addRehearsal = (bandId, log) => addItem('rehearsals', bandId, log);
export const updateRehearsal = (bandId, id, data) => updateItem('rehearsals', bandId, id, data);
export const deleteRehearsal = (bandId, id) => deleteItem('rehearsals', bandId, id);

export const getGigs = (bandId, pageSize = 50) => getCollection('gigs', bandId, pageSize);
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

export const getGigsPaginated = (bandId, pageSize = 10, lastVisible = null) =>
    getPaginatedCollection('gigs', bandId, pageSize, lastVisible);

export const addGig = (bandId, gig) => addItem('gigs', bandId, gig);
export const updateGig = (bandId, id, data) => updateItem('gigs', bandId, id, data);
export const deleteGig = (bandId, id) => deleteItem('gigs', bandId, id);

export const getGear = (bandId, pageSize = 50) => getCollection('gear', bandId, pageSize);
export const getGearPaginated = (bandId, pageSize = 15, lastVisible = null) =>
    getPaginatedCollection('gear', bandId, pageSize, lastVisible);

export const addGear = (bandId, item) => addItem('gear', bandId, item);
export const updateGear = (bandId, id, data) => updateItem('gear', bandId, id, data);
export const deleteGear = (bandId, id) => deleteItem('gear', bandId, id);
export const bulkAddGear = (bandId, gear) => bulkAddItems('gear', bandId, gear);

export const getFinances = (bandId, pageSize = 50) => getCollection('finances', bandId, pageSize);
export const getFinancesPaginated = (bandId, pageSize = 15, lastVisible = null) =>
    getPaginatedCollection('finances', bandId, pageSize, lastVisible);

export const addFinance = (bandId, record) => addItem('finances', bandId, record);
export const updateFinance = (bandId, id, data) => updateItem('finances', bandId, id, data);
export const deleteFinance = (bandId, id) => deleteItem('finances', bandId, id);

// Consolidated: inviteUserToBand functionality is now handled by createInvite

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
