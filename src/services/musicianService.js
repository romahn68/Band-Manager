import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { createMusicianModel } from '../models/DataModels';
import { ROLES } from '../utils/constants';
import { getCollectionCount, getCollection, getPaginatedCollection, updateItem, deleteItem } from './baseDbService';

export const getMusiciansCount = (bandId) => getCollectionCount('musicians', bandId);

export const getMusicians = async (bandId, pageSize = 50) => {
    try {
        const musicians = await getCollection('musicians', bandId, pageSize);
        const uids = [...new Set(musicians.map(m => m.uid).filter(Boolean))];
        
        if (uids.length === 0) return musicians;

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

export const addMusician = async (bandId, musician) => {
    if (!bandId) throw new Error("No band selected");
    const docRef = doc(collection(db, "bands", bandId, "musicians"));
    const structuredItem = createMusicianModel({ ...musician, bandId });
    await setDoc(docRef, structuredItem);
    return docRef.id;
};

export const updateMusician = (bandId, id, data) => updateItem('musicians', bandId, id, data);
export const deleteMusician = (bandId, id) => deleteItem('musicians', bandId, id);

export const updateMemberRole = async (bandId, memberUid, newRole) => {
    try {
        const batch = writeBatch(db);
        const bandRef = doc(db, "bands", bandId);
        const memberRef = doc(db, "bands", bandId, "musicians", memberUid);

        batch.update(memberRef, { role: newRole });

        if (newRole === ROLES.ADMIN) {
            batch.update(bandRef, { admins: arrayUnion(memberUid) });
        } else {
            batch.update(bandRef, { admins: arrayRemove(memberUid) });
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
