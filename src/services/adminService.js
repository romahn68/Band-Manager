import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

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
