const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { Resend } = require("resend");

admin.initializeApp();

// Initialize Resend with API Key from environment variables
// Note: In production, set this via: firebase functions:config:set resend.key="YOUR_KEY"
// Or use defineSecret for V2 functions. For now, we'll try process.env for local dev support
const resend = new Resend(process.env.RESEND_API_KEY || functions.config().resend?.key);

exports.sendInvitation = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        try {
            const { toEmail, bandName, inviteCode } = req.body;

            if (!toEmail || !bandName || !inviteCode) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            // Basic validation of auth (optional but recommended to check if user is authenticated)
            // const idToken = req.headers.authorization?.split('Bearer ')[1];
            // await admin.auth().verifyIdToken(idToken);

            const { data, error } = await resend.emails.send({
                from: "Band Manager <onboarding@resend.dev>",
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
        `,
            });

            if (error) {
                console.error("Resend API Error:", error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ success: true, id: data.id });
        } catch (error) {
            console.error("Function Error:", error);
            return res.status(500).json({ error: error.message });
        }
    });
});
