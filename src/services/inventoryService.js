import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { createGearModel } from '../models/DataModels';
import { getCollection, getPaginatedCollection, updateItem, deleteItem } from './baseDbService';

export const getGear = (bandId, pageSize = 50) => getCollection('gear', bandId, pageSize);
export const getGearPaginated = (bandId, pageSize = 15, lastVisible = null) => 
    getPaginatedCollection('gear', bandId, pageSize, lastVisible);

export const addGear = async (bandId, item) => {
    if (!bandId) throw new Error("No band selected");
    const docRef = doc(collection(db, "bands", bandId, "gear"));
    const structuredItem = createGearModel({ ...item, bandId });
    await setDoc(docRef, structuredItem);
    return docRef.id;
};

export const updateGear = (bandId, id, data) => updateItem('gear', bandId, id, data);
export const deleteGear = (bandId, id) => deleteItem('gear', bandId, id);

export const bulkAddGear = async (bandId, gear) => {
    if (!bandId || !gear.length) return;
    const batch = writeBatch(db);
    const collRef = collection(db, "bands", bandId, "gear");

    gear.forEach(item => {
        const docRef = doc(collRef);
        batch.set(docRef, createGearModel({ ...item, bandId }));
    });

    await batch.commit();
};
