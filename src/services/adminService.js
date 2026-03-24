import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc, onSnapshot, deleteDoc, writeBatch } from 'firebase/firestore';

// --- USERS ---
export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting all users:", error);
        throw error;
    }
};

// --- FEATURE FLAGS ---
export const getSystemSettings = async () => {
    try {
        const docRef = doc(db, "system_settings", "config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Create default if missing
            const defaults = {
                maintenanceMode: false,
                enableBetaFeatures: false,
                enableAiAssistant: false
            };
            await setDoc(docRef, defaults);
            return defaults;
        }
    } catch (error) {
        console.error("Error getting settings:", error);
        return {};
    }
};

export const subscribeToSettings = (callback) => {
    return onSnapshot(
        doc(db, "system_settings", "config"),
        (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            } else {
                callback({ maintenanceMode: false });
            }
        },
        (error) => {
            console.warn("Subscripción a settings denegada o fallida, usando defaults:", error.message);
            callback({ maintenanceMode: false });
        }
    );
};

export const toggleFeatureFlag = async (flagName, newValue) => {
    const docRef = doc(db, "system_settings", "config");
    await setDoc(docRef, { [flagName]: newValue }, { merge: true });
};

// --- BANDS MANAGEMENT ---
export const getAllBands = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "bands"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting all bands:", error);
        throw error;
    }
};

// --- SYSTEM CONTROL (DESTRUCTIVE) ---
export const deleteUserAdmin = async (userId) => {
    try {
        await deleteDoc(doc(db, "users", userId));
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

export const updateUserSysAdmin = async (userId, isSysAdmin) => {
    try {
        const docRef = doc(db, "users", userId);
        await setDoc(docRef, { sysAdmin: isSysAdmin }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating sysAdmin role:", error);
        throw error;
    }
};

export const getBandDetails = async (bandId) => {
    try {
        const docRef = doc(db, "bands", bandId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting band details:", error);
        throw error;
    }
};

/**
 * Borrado en cascada (Client-side implementation)
 * Nota: En producción masiva se recomienda Cloud Functions, 
 * pero para el Cuarto de Máquinas inicial esto es lo más directo.
 */
export const deleteBandCascade = async (bandId) => {
    try {
        let currentBatch = writeBatch(db);
        let operationCount = 0;
        let batchesCommitted = 0;

        const commitCurrentBatch = async () => {
            if (operationCount > 0) {
                await currentBatch.commit();
                batchesCommitted++;
                currentBatch = writeBatch(db); // new batch
                operationCount = 0;
            }
        };

        const addToBatch = async (docRef, operation = 'delete', data = null) => {
            if (operationCount >= 490) { // Safety margin before 500 limit
                await commitCurrentBatch();
            }
            if (operation === 'delete') {
                currentBatch.delete(docRef);
            } else if (operation === 'set') {
                currentBatch.set(docRef, data);
            }
            operationCount++;
        };

        // 1. Delete main document
        await addToBatch(doc(db, "bands", bandId), 'delete');
        
        // 2. Delete known subcollections
        const subcollections = ['songs', 'gigs', 'rehearsals', 'gear', 'musicians', 'finances', 'comments', 'messages', 'invitations'];
        
        for (const sub of subcollections) {
            const snap = await getDocs(collection(db, "bands", bandId, sub));
            for (const d of snap.docs) {
                await addToBatch(d.ref, 'delete');
            }
        }

        // Commit remaining
        await commitCurrentBatch();
        
        console.log(`Cascade delete finished for band ${bandId}. Batches: ${batchesCommitted}`);
        return true;
    } catch (error) {
        console.error("Error in cascade delete:", error);
        throw error;
    }
};
