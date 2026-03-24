const admin = require("firebase-admin");

admin.initializeApp();

// ✅ Resend eliminado — Las invitaciones se envían vía enlace de WhatsApp directamente desde el cliente.
// Ver: src/pages/Musicians.jsx → handleShareWA()
// No hay Cloud Functions activas en este momento.
