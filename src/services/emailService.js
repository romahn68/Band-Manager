import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

/**
 * Sends an invitation email using a Firebase Cloud Function (Resend.com integration)
 * @param {string} toEmail - Recipient email
 * @param {string} bandName - Name of the band
 * @param {string} inviteCode - Unique invitation code
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const sendInvitationEmail = async (toEmail, bandName, inviteCode) => {
    try {
        const sendInvitation = httpsCallable(functions, 'sendInvitation');
        const result = await sendInvitation({ toEmail, bandName, inviteCode });

        // onCall returns data wrapped in a 'data' property
        return result.data;
    } catch (error) {
        console.error("Invitation Email Error:", error);
        return { 
            success: false, 
            error: error.message,
            message: "No se pudo enviar el correo de invitación. Revisa la consola para más detalles."
        };
    }
};
