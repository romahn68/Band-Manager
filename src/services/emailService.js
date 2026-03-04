import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

export const sendInvitationEmail = async (toEmail, bandName, inviteCode) => {
    try {
        const sendInvitation = httpsCallable(functions, 'sendInvitation');
        const result = await sendInvitation({ toEmail, bandName, inviteCode });

        return result.data;
    } catch (error) {
        console.error("Cloud Function Error:", error);
        return { success: false, error: error.message };
    }
};
