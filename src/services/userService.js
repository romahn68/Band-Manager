import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const updateUserProfile = async (uid, data) => {
    const userRef = doc(db, "users", uid);
    try {
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
