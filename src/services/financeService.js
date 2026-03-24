import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { createFinanceTransactionModel } from '../models/DataModels';
import { getCollection, getPaginatedCollection, updateItem, deleteItem } from './baseDbService';

export const getFinances = (bandId, pageSize = 50) => getCollection('finances', bandId, pageSize);
export const getFinancesPaginated = (bandId, pageSize = 15, lastVisible = null) => 
    getPaginatedCollection('finances', bandId, pageSize, lastVisible);

export const addFinance = async (bandId, record) => {
    if (!bandId) throw new Error("No band selected");
    const docRef = doc(collection(db, "bands", bandId, "finances"));
    const structuredItem = createFinanceTransactionModel({ ...record, bandId });
    await setDoc(docRef, structuredItem);
    return docRef.id;
};

export const updateFinance = (bandId, id, data) => updateItem('finances', bandId, id, data);
export const deleteFinance = (bandId, id) => deleteItem('finances', bandId, id);
