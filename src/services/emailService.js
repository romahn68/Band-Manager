/**
 * Email Service using Resend
 * Note: specific API Key should be set in environment variables (VITE_RESEND_API_KEY)
 * WARNING: Sending from client-side exposes the API Key. 
 * For production, use a backend proxy or Firebase Cloud Function.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
// Placeholder key - User should replace this or use env var
const API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export const sendInvitationEmail = async (toEmail, bandName, inviteCode) => {
    if (!API_KEY || API_KEY === 're_your_api_key_here') {
        console.warn("Resend API Key is missing or default. Email simulation only.");
        return {
            success: false,
            message: "Falta configuración de API Key de Resend. Por favor agrega tu clave en el archivo .env"
        };
    }

    try {
        const response = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                from: 'Band Manager <onboarding@resend.dev>', // Default testing domain
                to: [toEmail],
                subject: `Invitación a unirte a ${bandName}`,
                html: `
                    <div style="font-family: sans-serif; color: #333;">
                        <h1>¡Has sido invitado!</h1>
                        <p>Hola,</p>
                        <p>Te han invitado a unirte a la banda <strong>${bandName}</strong> en Band Manager.</p>
                        <p>Usa el siguiente código de invitación para unirte:</p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
                            ${inviteCode}
                        </div>
                        <p>Si aún no tienes cuenta, regístrate gratis.</p>
                        <br/>
                        <p>Saludos,<br/>El equipo de Band Manager</p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error sending email');
        }

        const data = await response.json();
        return { success: true, id: data.id };

    } catch (error) {
        console.error("Resend Error:", error);
        return { success: false, error: error.message };
    }
};
