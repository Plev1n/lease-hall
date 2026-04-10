const nodemailer = require('nodemailer');

// Environment variables (set in Vercel dashboard):
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// MAIL_TO - recipient email
// RECAPTCHA_SECRET_KEY - reCAPTCHA v3 secret

const LOG_PREFIX = '[lease-hall-form]';

function log(level, message, data = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...data,
    };
    console[level === 'error' ? 'error' : 'log'](`${LOG_PREFIX} ${JSON.stringify(entry)}`);
}

async function verifyRecaptcha(token) {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        log('warn', 'RECAPTCHA_SECRET_KEY not set, skipping verification');
        return { success: true, score: 1.0 };
    }

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    return res.json();
}

function createTransport() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>]/g, '').trim().slice(0, 2000);
}

function buildEmailHtml({ name, email, phone, hall, message }) {
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
            Nová poptávka — Průmyslový areál Frýdlant
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;">Jméno:</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">E-mail:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Telefon:</td><td style="padding: 8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>` : ''}
            ${hall ? `<tr><td style="padding: 8px 0; color: #666;">Prostor:</td><td style="padding: 8px 0; font-weight: bold; color: #f59e0b;">${hall}</td></tr>` : ''}
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
            <strong>Zpráva:</strong><br>
            <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
            Odesláno z webu areal-frydlant.cz — ${new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })}
        </p>
    </div>`;
}

module.exports = async function handler(req, res) {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, hall, message, recaptchaToken } = req.body || {};

    // Basic validation
    if (!name || !email || !message) {
        log('warn', 'Missing required fields', { name: !!name, email: !!email, message: !!message });
        return res.status(400).json({ error: 'Vyplňte povinná pole (jméno, e-mail, zpráva).' });
    }

    // Sanitize inputs
    const data = {
        name: sanitize(name),
        email: sanitize(email),
        phone: sanitize(phone || ''),
        hall: sanitize(hall || ''),
        message: sanitize(message),
    };

    // Log the submission
    log('info', 'Form submission received', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        hall: data.hall,
        messageLength: data.message.length,
    });

    // Verify reCAPTCHA
    try {
        const captchaResult = await verifyRecaptcha(recaptchaToken || '');
        log('info', 'reCAPTCHA result', { success: captchaResult.success, score: captchaResult.score });

        if (!captchaResult.success || (captchaResult.score !== undefined && captchaResult.score < 0.3)) {
            log('warn', 'reCAPTCHA failed', { score: captchaResult.score });
            return res.status(403).json({ error: 'Ověření reCAPTCHA selhalo. Zkuste to znovu.' });
        }
    } catch (err) {
        log('error', 'reCAPTCHA verification error', { error: err.message });
        // Continue anyway — don't block real users due to reCAPTCHA outage
    }

    // Send email via SMTP
    if (!process.env.SMTP_HOST) {
        log('warn', 'SMTP not configured, skipping email send');
        return res.status(200).json({
            success: true,
            message: 'Poptávka zaznamenána (SMTP není nakonfigurováno — e-mail nebyl odeslán).',
        });
    }

    try {
        const transport = createTransport();
        const mailTo = process.env.MAIL_TO || process.env.SMTP_USER;
        const subject = data.hall
            ? `Poptávka: ${data.hall} — ${data.name}`
            : `Poptávka z webu — ${data.name}`;

        await transport.sendMail({
            from: `"Areál Frýdlant web" <${process.env.SMTP_USER}>`,
            replyTo: data.email,
            to: mailTo,
            subject,
            html: buildEmailHtml(data),
            text: `Jméno: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone}\nProstor: ${data.hall}\n\nZpráva:\n${data.message}`,
        });

        log('info', 'Email sent successfully', { to: mailTo, subject });
        return res.status(200).json({ success: true, message: 'Poptávka odeslána!' });
    } catch (err) {
        log('error', 'Email send failed', { error: err.message, code: err.code });
        return res.status(500).json({ error: 'Nepodařilo se odeslat e-mail. Zkuste to prosím znovu nebo nás kontaktujte telefonicky.' });
    }
};
