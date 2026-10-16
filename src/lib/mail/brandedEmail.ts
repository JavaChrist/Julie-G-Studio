import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export const BRAND = {
  cream: '#F5E9DC',
  card: '#FBF9F6',
  primary: '#D08C60',
  primaryDark: '#A56745',
  charcoal: '#2C2C2C',
  taupe: '#B9A89D',
  white: '#FFFFFF',
  phone: '06 68 00 64 54',
  emailPro: 'contact@jg-photographie.fr',
  emailPerso: 'jgrohens.photographie@gmail.com',
  websiteLabel: 'www.jg-photographie.fr',
  websiteUrl: 'https://www.jg-photographie.fr',
  instagramHandle: '@j_g.photographie',
  instagramUrl: 'https://www.instagram.com/j_g.photographie',
  signature: 'Julie Grohens',
  tagline: "Photographe d'émotions",
  region: 'Normandie & alentours',
} as const;

export const LOGO_CID = 'logo@jg-photographie.fr';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function emailButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 4px;">
    <tr>
      <td align="center" bgcolor="${BRAND.primary}" style="border-radius:8px;">
        <a href="${safeHref}" style="display:inline-block; padding:14px 28px; font-family:${FONT}; font-size:15px; font-weight:600; color:${BRAND.white}; text-decoration:none; border-radius:8px;">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </table>`;
}

export function renderBrandedEmail(options: {
  title: string;
  preheader: string;
  contentHtml: string;
  footerNote: string;
}): string {
  const title = escapeHtml(options.title);
  const preheader = escapeHtml(options.preheader);
  const footerNote = escapeHtml(options.footerNote);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background:${BRAND.cream};">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    ${preheader}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; width:100%; background:${BRAND.card}; border-radius:16px;">
          <tr>
            <td align="center" style="padding:36px 32px 8px;">
              <img src="cid:${LOGO_CID}" width="96" height="96" alt="Julie Grohens Photographie" style="display:block; border:0; outline:none; width:96px; height:96px; border-radius:22px;" />
              <p style="margin:16px 0 0; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:0.16em; text-transform:uppercase; color:${BRAND.taupe};">
                ${escapeHtml(BRAND.tagline)}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:12px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48" height="2" bgcolor="${BRAND.primary}" style="font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px; font-family:${FONT}; color:${BRAND.charcoal}; font-size:15px; line-height:1.6;">
              ${options.contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px; font-family:${FONT}; color:${BRAND.charcoal};">
              <p style="margin:18px 0 4px; font-size:14px; line-height:1.6; color:${BRAND.charcoal};">
                Avec toute ma gratitude,
              </p>
              <p style="margin:0; font-size:16px; font-weight:600; color:${BRAND.charcoal};">${escapeHtml(BRAND.signature)}</p>
              <p style="margin:2px 0 0; font-size:13px; color:${BRAND.taupe}; font-style:italic;">
                ${escapeHtml(BRAND.tagline)} — ${escapeHtml(BRAND.region)}
              </p>
              <p style="margin:14px 0 0; font-size:13px; line-height:1.7; color:${BRAND.charcoal};">
                <a href="mailto:${escapeHtml(BRAND.emailPro)}" style="color:${BRAND.primaryDark}; text-decoration:none;">${escapeHtml(BRAND.emailPro)}</a><br/>
                ${escapeHtml(BRAND.phone)}<br/>
                <a href="${escapeHtml(BRAND.websiteUrl)}" style="color:${BRAND.primaryDark}; text-decoration:none;">${escapeHtml(BRAND.websiteLabel)}</a>
                &nbsp;·&nbsp;
                <a href="${escapeHtml(BRAND.instagramUrl)}" style="color:${BRAND.primaryDark}; text-decoration:none;">${escapeHtml(BRAND.instagramHandle)}</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0; max-width:600px; font-family:${FONT}; font-size:11px; line-height:1.5; color:${BRAND.taupe}; text-align:center;">
          ${footerNote}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function logoAttachment(): nodemailer.SendMailOptions['attachments'] {
  const logoPath = path.join(process.cwd(), 'public', 'logo192.png');
  if (!fs.existsSync(logoPath)) return [];
  return [
    {
      filename: 'logo.png',
      path: logoPath,
      cid: LOGO_CID,
    },
  ];
}

export function createMailTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP non configuré côté serveur');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendBrandedMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  const user = process.env.SMTP_USER;
  const from = process.env.MAIL_FROM || user || BRAND.emailPro;
  const replyTo = options.replyTo || process.env.MAIL_REPLY_TO || process.env.MAIL_TO || user || BRAND.emailPro;
  const transporter = createMailTransport();

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo,
    attachments: logoAttachment(),
  });
}
