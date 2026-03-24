import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc } from 'firebase/firestore';
import { createRehearsalModel, createGigModel } from '../models/DataModels';
import { getCollectionCount, getCollection, getPaginatedCollection, updateItem, deleteItem } from './baseDbService';

// Rehearsals
export const getRehearsalsCount = (bandId) => getCollectionCount('rehearsals', bandId);
export const getRehearsals = (bandId, pageSize = 50) => getCollection('rehearsals', bandId, pageSize);
export const getRehearsalsPaginated = (bandId, pageSize = 15, lastVisible = null) =>
    getPaginatedCollection('rehearsals', bandId, pageSize, lastVisible);

export const addRehearsal = async (bandId, log) => {
    if (!bandId) throw new Error("No band selected");
    const docRef = doc(collection(db, "bands", bandId, "rehearsals"));
    const structuredItem = createRehearsalModel({ ...log, bandId });
    await setDoc(docRef, structuredItem);
    return docRef.id;
};
export const updateRehearsal = (bandId, id, data) => updateItem('rehearsals', bandId, id, data);
export const deleteRehearsal = (bandId, id) => deleteItem('rehearsals', bandId, id);

// Gigs
export const getGigsCount = (bandId) => getCollectionCount('gigs', bandId);
export const getGigs = (bandId, pageSize = 50) => getCollection('gigs', bandId, pageSize);
export const getGigsPaginated = (bandId, pageSize = 10, lastVisible = null) =>
    getPaginatedCollection('gigs', bandId, pageSize, lastVisible);

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

export const addGig = async (bandId, gig) => {
    if (!bandId) throw new Error("No band selected");
    const docRef = doc(collection(db, "bands", bandId, "gigs"));
    const structuredItem = createGigModel({ ...gig, bandId });
    await setDoc(docRef, structuredItem);
    return docRef.id;
};
export const updateGig = (bandId, id, data) => updateItem('gigs', bandId, id, data);
export const deleteGig = (bandId, id) => deleteItem('gigs', bandId, id);
