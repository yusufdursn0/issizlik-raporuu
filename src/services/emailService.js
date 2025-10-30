const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback: e-posta yoksa sadece console’a yaz.
        transporter = {
            sendMail: async (opts) => {
                console.log('📧 [DEV EMAIL]', { to: opts.to, subject: opts.subject, html: opts.html });
                return { messageId: 'dev-mail' };
            }
        };
    }
    return transporter;
}

async function sendMail({ to, subject, html }) {
    const t = await getTransporter();
    return t.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@career-health.local',
        to,
        subject,
        html
    });
}

module.exports = { sendMail };