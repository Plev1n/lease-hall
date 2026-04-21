// Vercel serverless handler for contact-form submissions.
// Flow: validate → reCAPTCHA Enterprise verify → send email via Resend.
// Env vars (set in Vercel dashboard):
//   RESEND_API_KEY        — Resend API key (re_…)
//   RESEND_FROM           — sender, e.g. "Areál NORMA FnO <pronajem@arealfno.cz>"
//                           (falls back to onboarding@resend.dev if unset)
//   MAIL_TO               — recipient email address
//   RECAPTCHA_API_KEY     — Google Cloud API key restricted to reCAPTCHA Enterprise API
//   GCP_PROJECT_ID        — Cloud project ID (e.g. "arealfno-ads")
// If RECAPTCHA_API_KEY or GCP_PROJECT_ID are unset, reCAPTCHA verification is skipped
// (fail-open — same pattern as the previous backend).

const LOG_PREFIX = '[lease-hall-form]';
const RECAPTCHA_SITE_KEY = '6LfSj8EsAAAAANNN7x6Qgr5rCAdEc71ixh4rbxMj';
const RECAPTCHA_SCORE_THRESHOLD = 0.3;

function log(level, message, data = {}) {
    const entry = { timestamp: new Date().toISOString(), level, message, ...data };
    console[level === 'error' ? 'error' : 'log'](`${LOG_PREFIX} ${JSON.stringify(entry)}`);
}

async function verifyRecaptchaEnterprise(token, action) {
    const apiKey = process.env.RECAPTCHA_API_KEY;
    const projectId = process.env.GCP_PROJECT_ID;
    if (!apiKey || !projectId) {
        log('warn', 'reCAPTCHA Enterprise not configured, skipping verification');
        return { valid: true, reason: 'not_configured' };
    }
    if (!token) {
        return { valid: false, reason: 'no_token' };
    }
    try {
        const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: {
                    token,
                    siteKey: RECAPTCHA_SITE_KEY,
                    expectedAction: action || 'submit',
                },
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            log('error', 'reCAPTCHA Enterprise HTTP error', { status: res.status, data });
            return { valid: false, reason: 'api_error', httpStatus: res.status, apiError: data.error };
        }
        const tokenProps = data.tokenProperties || {};
        const riskAnalysis = data.riskAnalysis || {};
        if (!tokenProps.valid) {
            return { valid: false, reason: tokenProps.invalidReason || 'invalid_token', tokenProps };
        }
        const score = typeof riskAnalysis.score === 'number' ? riskAnalysis.score : 1.0;
        return {
            valid: score >= RECAPTCHA_SCORE_THRESHOLD,
            score,
            reason: score < RECAPTCHA_SCORE_THRESHOLD ? 'low_score' : 'ok',
        };
    } catch (err) {
        log('error', 'reCAPTCHA Enterprise request failed', { error: err.message });
        return { valid: true, reason: 'verify_error' };
    }
}

function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>]/g, '').trim().slice(0, 2000);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildEmailHtml({ name, email, phone, hall, message }) {
    const esc = escapeHtml;
    return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
            Nová poptávka — Areál NORMA FnO
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;">Jméno:</td><td style="padding: 8px 0; font-weight: bold;">${esc(name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">E-mail:</td><td style="padding: 8px 0;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Telefon:</td><td style="padding: 8px 0;"><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>` : ''}
            ${hall ? `<tr><td style="padding: 8px 0; color: #666;">Prostor:</td><td style="padding: 8px 0; font-weight: bold; color: #f59e0b;">${esc(hall)}</td></tr>` : ''}
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
            <strong>Zpráva:</strong>
            <p style="white-space: pre-wrap; margin: 8px 0 0;">${esc(message)}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
            Odesláno z arealfno.cz — ${new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })}
        </p>
    </div>`;
}

async function sendEmailViaResend({ from, to, replyTo, subject, html, text }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not set');
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, reply_to: replyTo, subject, html, text }),
    });
    const responseText = await res.text();
    if (!res.ok) {
        throw new Error(`Resend ${res.status}: ${responseText.slice(0, 300)}`);
    }
    try { return JSON.parse(responseText); } catch { return {}; }
}

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, email, phone, hall, message, action, recaptchaToken } = req.body || {};

    if (!name || !email || !message) {
        log('warn', 'Missing required fields', { hasName: !!name, hasEmail: !!email, hasMessage: !!message });
        return res.status(400).json({ error: 'Vyplňte povinná pole (jméno, e-mail, zpráva).' });
    }

    const data = {
        name: sanitize(name),
        email: sanitize(email),
        phone: sanitize(phone || ''),
        hall: sanitize(hall || ''),
        message: sanitize(message),
    };
    log('info', 'Form submission received', {
        name: data.name,
        email: data.email,
        hall: data.hall,
        action,
        messageLength: data.message.length,
    });

    const captcha = await verifyRecaptchaEnterprise(recaptchaToken, action);
    log('info', 'reCAPTCHA result', captcha);
    if (!captcha.valid) {
        return res.status(403).json({
            error: 'Ověření zabezpečení selhalo. Zkuste to prosím znovu.',
            debug: captcha,
        });
    }

    const from = process.env.RESEND_FROM || 'Areál NORMA FnO <onboarding@resend.dev>';
    const to = process.env.MAIL_TO;
    if (!to) {
        log('error', 'MAIL_TO not set');
        return res.status(500).json({ error: 'Server není správně nakonfigurován. Kontaktujte nás prosím telefonicky.' });
    }
    const subject = data.hall
        ? `Poptávka: ${data.hall} — ${data.name}`
        : `Poptávka z webu — ${data.name}`;
    try {
        const result = await sendEmailViaResend({
            from,
            to,
            replyTo: data.email,
            subject,
            html: buildEmailHtml(data),
            text: `Jméno: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone}\nProstor: ${data.hall}\n\nZpráva:\n${data.message}\n\n— Odesláno z arealfno.cz`,
        });
        log('info', 'Email sent', { to, subject, resendId: result.id });
        return res.status(200).json({ success: true, message: 'Poptávka odeslána!' });
    } catch (err) {
        log('error', 'Email send failed', { error: err.message });
        return res.status(500).json({ error: 'Nepodařilo se odeslat e-mail. Zkuste to prosím znovu nebo nás kontaktujte telefonicky.' });
    }
};
