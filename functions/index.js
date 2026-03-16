const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { Resend } = require("resend");

admin.initializeApp();

// Initialize Resend with API Key provided by user
const RESEND_API_KEY = "re_DVZfsFx8_6X2GnG5oRgQ4YtUAnVaHzbat";
const resend = new Resend(RESEND_API_KEY);

/**
 * Cloud Function to send band invitations via Resend.com
 * Using V2 onCall for better compatibility and bypassing 1st Gen service account issues
 */
exports.sendInvitation = onCall(async (request) => {
    // Check if user is authenticated (V2 uses request.auth)
    if (!request.auth) {
        throw new HttpsError(
            'unauthenticated',
            'Debe iniciar sesión para enviar invitaciones.'
        );
    }

    // In V2 onCall, data is inside request.data
    const { toEmail, bandName, inviteCode } = request.data;

    if (!toEmail || !bandName || !inviteCode) {
        throw new HttpsError(
            'invalid-argument',
            'Faltan campos obligatorios: email, nombre de banda o código.'
        );
    }

    try {
        const result = await resend.emails.send({
            from: "Band Manager <onboarding@resend.dev>", 
            to: [toEmail],
            subject: `¡Te han invitado a unirte a ${bandName}!`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0a0a0c;
      font-family: Arial, sans-serif;
      color: #f3f4f6;
    }
    .wrapper {
      padding: 40px 20px;
      background-color: #0a0a0c;
    }
    .card {
      max-width: 500px;
      margin: 0 auto;
      background: rgba(23, 23, 26, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
    }
    .logo {
      width: 60px;
      height: 60px;
      background: #8b5cf6;
      border-radius: 12px;
      display: inline-block;
      line-height: 60px;
      font-size: 24px;
      font-weight: bold;
      color: #fff;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 16px;
      color: #fff;
    }
    p {
      color: #9ca3af;
      line-height: 1.6;
      margin-bottom: 24px;
      font-size: 16px;
    }
    .band-name {
      color: #8b5cf6;
      font-weight: bold;
      font-size: 20px;
    }
    .code-container {
      background: rgba(255, 255, 255, 0.05);
      border: 1px dashed rgba(139, 92, 246, 0.5);
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
    }
    .code-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #10b981;
      margin-bottom: 8px;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      color: #fff;
      letter-spacing: 4px;
    }
    .btn {
      display: inline-block;
      background: #8b5cf6;
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 10px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #4b5563;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <img src="https://band-manager-a355f.web.app/logo-email.jpg" alt="Band Manager Logo" style="width: 80px; height: 80px; margin-bottom: 24px; border-radius: 12px;">
      <h1>¡Estás invitado!</h1>
      <p>Has sido invitado a unirte a la banda <br> <span class="band-name">${bandName}</span> en Band Manager.</p>
      
      <div class="code-container">
        <div class="code-label">Código de Invitación</div>
        <div class="code">${inviteCode}</div>
      </div>
      
      <p>Entra a la plataforma y usa este código para unirte a los ensayos, ver las finanzas y gestionar tu equipo.</p>
      
      <a href="https://band-manager-a355f.web.app/unirse/${inviteCode}" class="btn">Unirse a la Banda</a>
      
      <div class="footer">
        Este es un correo automático enviado por Band Manager. <br>
        &copy; 2026 Band Manager Team
      </div>
    </div>
  </div>
</body>
</html>
            `,
        });

        if (result.error) {
            console.error("Resend API Error:", result.error);
            throw new HttpsError('internal', result.error.message);
        }

        return { success: true, id: result.data.id };
    } catch (error) {
        console.error("Function Error:", error);
        throw new HttpsError('internal', error.message);
    }
});
