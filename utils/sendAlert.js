const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'boujemaarayen25@gmail.com',
    pass: 'jatqfdgxwoictomw'
  }
});

const sendAlertEmail = async ({ to, subject, roomName, type, severity, description }) => {
  try {
    const severityColor = severity === 'critique' ? '#ff0000' : severity === 'moyen' ? '#ff8800' : '#ffcc00';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${severityColor}; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 Alerte Incident</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Détails de l'incident</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Salle</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${roomName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Type</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${type}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Sévérité</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: ${severityColor};"><strong>${severity.toUpperCase()}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>Description</strong></td>
              <td style="padding: 10px;">${description}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement par le système de supervision des salles serveurs.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Server Room Monitor 🖥️" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`✅ Email envoyé à ${to}`);
    return true;

  } catch (error) {
    console.error('❌ Erreur envoi email :', error.message);
    return false;
  }
};

module.exports = sendAlertEmail;