import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, writeBatch, limit, arrayUnion } from 'firebase/firestore';
import { createBandModel, createMusicianModel, createGlobalUser, createInvitationModel } from '../models/DataModels';
import { ROLES } from '../utils/constants';
import { generateIdCode } from '../utils/codeGenerator';

export const getBand = async (bandId) => {
    const docRef = doc(db, "bands", bandId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getBandsByUser = async (uid) => {
    const q = query(collection(db, "bands"), where("members", "array-contains", uid));
    const querySnapshot = await getDocs(q);
    const bands = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return bands.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
};

export const createBand = async (user, bandName = "Mi Nueva Banda") => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bandRef = doc(collection(db, "bands")); 
    const memberRef = doc(db, "bands", bandRef.id, "musicians", user.uid);

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

export const updateBand = async (bandId, data) => await updateDoc(doc(db, "bands", bandId), data);
export const updateBandMetadata = updateBand;

export const getBandByInviteCode = async (inviteCode) => {
    const q = query(collection(db, "bands"), where("inviteCode", "==", inviteCode.toUpperCase()), limit(1));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty ? { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } : null;
};

export const joinBand = async (bandId, user) => {
    const bandRef = doc(db, "bands", bandId);
    const bandSnap = await getDoc(bandRef);
    if (!bandSnap.exists()) throw new Error("La banda no existe");
    if (bandSnap.data().members.includes(user.uid)) return;

    const inviteRef = doc(db, "bands", bandId, "invitations", user.email.toLowerCase());
    const inviteSnap = await getDoc(inviteRef);
    const inviteData = inviteSnap.exists() ? inviteSnap.data() : null;

    const memberRef = doc(db, "bands", bandId, "musicians", user.uid);
    const batch = writeBatch(db);

    batch.update(bandRef, { members: arrayUnion(user.uid) });

    const memberData = createMusicianModel({
        uid: user.uid,
        role: inviteData?.permisos || ROLES.VISOR,
        profile: inviteData?.perfil || 'Musico',
        instrumentId: generateIdCode('instrument'),
        instrumentName: 'Por definir',
        bandId: bandId
    });

    batch.set(memberRef, memberData);

    if (inviteSnap.exists()) {
        batch.delete(inviteRef);
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
    const emailKey = inviteData.correo?.toLowerCase() || inviteData.email?.toLowerCase();
    const inviteRef = doc(db, "bands", bandId, "invitations", emailKey);
    const structuredInvite = createInvitationModel({ ...inviteData, bandId });
    await setDoc(inviteRef, structuredInvite);
};

export const getInviteByEmail = async (bandId, email) => {
    const inviteSnap = await getDoc(doc(db, "bands", bandId, "invitations", email.toLowerCase()));
    return inviteSnap.exists() ? inviteSnap.data() : null;
};
