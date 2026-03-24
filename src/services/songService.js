import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { createSongModel } from '../models/DataModels';
import { getCollectionCount, getCollection, getPaginatedCollection, updateItem, deleteItem } from './baseDbService';

export const getSongsCount = (bandId) => getCollectionCount('songs', bandId);
export const getSongs = (bandId, pageSize = 50) => getCollection('songs', bandId, pageSize);
export const getSongsPaginated = (bandId, pageSize = 15, lastVisible = null) => 
    getPaginatedCollection('songs', bandId, pageSize, lastVisible);

export const addSong = async (bandId, song) => {
    if (!bandId) throw new Error("No band selected");
    const docRef = doc(collection(db, "bands", bandId, "songs"));
    const structuredItem = createSongModel({ ...song, bandId });
    await setDoc(docRef, structuredItem);
    return docRef.id;
};

export const updateSong = (bandId, id, data) => updateItem('songs', bandId, id, data);
export const deleteSong = (bandId, id) => deleteItem('songs', bandId, id);

export const bulkAddSongs = async (bandId, songs) => {
    if (!bandId || !songs.length) return;
    const batch = writeBatch(db);
    const collRef = collection(db, "bands", bandId, "songs");

    songs.forEach(song => {
        const docRef = doc(collRef);
        batch.set(docRef, createSongModel({ ...song, bandId }));
    });

    await batch.commit();
};
