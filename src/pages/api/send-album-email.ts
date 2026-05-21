import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

interface SendAlbumEmailBody {
  albumCode: string;
  albumTitle: string;
  clientName?: string;
  clientEmail: string;
  photoCount: number;
  expireAt: string; // Date ISO
  category?: string;
  /**
   * Origine publique du site (ex: https://jg-photographie.fr).
   * Le client passe window.location.origin; en prod ce sera le bon domaine.
   */
  siteOrigin: string;
}

const PHONE = '06 68 00 64 54';
const CONTACT_EMAIL = 'contact@jg-photographie.fr';
const WEBSITE = 'www.jg-photographie.fr';
const INSTAGRAM_HANDLE = '@j_g.photographie';
const INSTAGRAM_URL = 'https://www.instagram.com/j_g.photographie';
const SIGNATURE = 'Julie Grohens';
const TAGLINE = 'Photographe d\'émotions';
const REGION = 'Normandie & alentours';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateFr(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function buildSubject(albumTitle: string): string {
  return `Vos photos sont prêtes - ${albumTitle}`;
}

function buildPlainText(data: SendAlbumEmailBody, accessUrl: string, expireFr: string): string {
  const greeting = data.clientName?.trim()
    ? `Bonjour ${data.clientName.trim()},`
    : 'Bonjour,';

  return `${greeting}

C'est avec un grand plaisir que je vous annonce que vos photos sont maintenant disponibles dans votre galerie privée personnalisée.

ACCÈS À VOS PHOTOS
1) Rendez-vous sur : ${accessUrl}
2) Entrez votre code d'accès personnel : ${data.albumCode}
3) Découvrez et téléchargez toutes vos photos

VOTRE GALERIE CONTIENT
- ${data.photoCount} photos haute définition sélectionnées avec soin
- Retouches professionnelles appliquées
- Format numérique prêt à imprimer
- Téléchargement illimité jusqu'au ${expireFr}

INSTALLER L'APPLICATION SUR VOTRE TÉLÉPHONE (recommandé)
Pour un accès plus rapide et plus pratique, vous pouvez installer la galerie comme une application sur votre téléphone. C'est gratuit, ça ne prend pas de place, et vous y accédez depuis votre écran d'accueil.

iPhone (Safari)
1) Ouvrez le lien ${accessUrl} dans Safari
2) Appuyez sur l'icône Partager (carré avec une flèche vers le haut, en bas de l'écran)
3) Faites défiler et appuyez sur "Sur l'écran d'accueil"
4) Appuyez sur "Ajouter" en haut à droite

Android (Chrome)
1) Ouvrez le lien ${accessUrl} dans Chrome
2) Appuyez sur le menu (3 points en haut à droite)
3) Appuyez sur "Ajouter à l'écran d'accueil" ou "Installer l'application"
4) Confirmez en appuyant sur "Ajouter" ou "Installer"

INFORMATIONS IMPORTANTES
- Votre galerie est sécurisée et accessible uniquement avec votre code personnel
- Vos photos seront disponibles jusqu'au ${expireFr}
- N'hésitez pas à les télécharger plusieurs fois si besoin
- Partagez le lien avec vos proches si vous le souhaitez

BESOIN D'AIDE ?
Si vous rencontrez la moindre difficulté ou avez des questions, n'hésitez pas à me contacter :
- Email : ${CONTACT_EMAIL}
- Téléphone : ${PHONE}
- Site : ${WEBSITE}
- Instagram : ${INSTAGRAM_HANDLE} (${INSTAGRAM_URL})

Avec toute ma gratitude,

${SIGNATURE}
${TAGLINE}
${REGION}
`;
}

function buildHtml(data: SendAlbumEmailBody, accessUrl: string, expireFr: string): string {
  const safeName = escapeHtml(data.clientName?.trim() || '');
  const greeting = safeName ? `Bonjour ${safeName},` : 'Bonjour,';
  const safeCode = escapeHtml(data.albumCode);
  const safeUrl = escapeHtml(accessUrl);
  const safePhotoCount = escapeHtml(data.photoCount);
  const safeExpire = escapeHtml(expireFr);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Vos photos sont prêtes</title>
</head>
<body style="margin:0; padding:0; background:#f5f1eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#3a3a3a;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f1eb; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #c9a875 0%, #b08d5b 100%); padding:32px 24px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:600; letter-spacing:0.5px;">
                Vos photos sont prêtes
              </h1>
              <p style="margin:8px 0 0; color:#fff8ef; font-size:14px; opacity:0.95;">
                ${escapeHtml(data.albumTitle)}
              </p>
            </td>
          </tr>

          <!-- Greeting + intro -->
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <p style="margin:0 0 12px; font-size:16px; color:#3a3a3a;">${greeting}</p>
              <p style="margin:0 0 8px; font-size:15px; line-height:1.6; color:#4a4a4a;">
                C'est avec un grand plaisir que je vous annonce que vos photos sont maintenant
                disponibles dans votre galerie privée personnalisée.
              </p>
            </td>
          </tr>

          <!-- Bloc accès -->
          <tr>
            <td style="padding:8px 28px 8px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fff8ef; border:1px solid #ead9bf; border-radius:10px;">
                <tr>
                  <td style="padding:20px;">
                    <h2 style="margin:0 0 12px; font-size:16px; color:#3a3a3a;">Accès à vos photos</h2>
                    <p style="margin:0 0 8px; font-size:14px; color:#4a4a4a; line-height:1.6;">
                      <strong>1.</strong> Rendez-vous sur :
                      <a href="${safeUrl}" style="color:#b08d5b; text-decoration:underline; word-break:break-all;">${safeUrl}</a>
                    </p>
                    <p style="margin:0 0 8px; font-size:14px; color:#4a4a4a; line-height:1.6;">
                      <strong>2.</strong> Entrez votre code d'accès personnel :
                    </p>
                    <p style="margin:0 0 12px; text-align:center;">
                      <span style="display:inline-block; padding:10px 20px; background:#ffffff; border:2px dashed #b08d5b; border-radius:8px; font-family:'Courier New', monospace; font-size:18px; font-weight:bold; color:#3a3a3a; letter-spacing:2px;">
                        ${safeCode}
                      </span>
                    </p>
                    <p style="margin:0; font-size:14px; color:#4a4a4a; line-height:1.6;">
                      <strong>3.</strong> Découvrez et téléchargez toutes vos photos.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Galerie info -->
          <tr>
            <td style="padding:16px 28px 8px 28px;">
              <h2 style="margin:0 0 8px; font-size:16px; color:#3a3a3a;">Votre galerie contient</h2>
              <ul style="margin:0; padding-left:20px; font-size:14px; color:#4a4a4a; line-height:1.8;">
                <li>${safePhotoCount} photos haute définition sélectionnées avec soin</li>
                <li>Retouches professionnelles appliquées</li>
                <li>Format numérique prêt à imprimer</li>
                <li>Téléchargement illimité jusqu'au <strong>${safeExpire}</strong></li>
              </ul>
            </td>
          </tr>

          <!-- Bloc PWA iOS / Android -->
          <tr>
            <td style="padding:16px 28px 8px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8f5f0; border-left:4px solid #b08d5b; border-radius:6px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <h2 style="margin:0 0 8px; font-size:16px; color:#3a3a3a;">
                      Astuce : installez l'application sur votre téléphone
                    </h2>
                    <p style="margin:0 0 14px; font-size:13px; color:#5a5a5a; line-height:1.6;">
                      Pour un accès plus rapide, ajoutez la galerie sur votre écran d'accueil.
                      C'est gratuit, ça ne prend quasiment pas de place, et vous y accédez en un clic.
                    </p>

                    <!-- iPhone -->
                    <div style="margin-bottom:14px;">
                      <p style="margin:0 0 6px; font-size:14px; font-weight:600; color:#3a3a3a;">Sur iPhone (Safari)</p>
                      <ol style="margin:0; padding-left:20px; font-size:13px; color:#4a4a4a; line-height:1.7;">
                        <li>Ouvrez le lien dans <strong>Safari</strong> (pas Chrome).</li>
                        <li>Touchez l'icône <strong>Partager</strong> (carré avec une flèche vers le haut, en bas de l'écran).</li>
                        <li>Faites défiler et touchez <strong>« Sur l'écran d'accueil »</strong>.</li>
                        <li>Touchez <strong>« Ajouter »</strong> en haut à droite.</li>
                      </ol>
                    </div>

                    <!-- Android -->
                    <div>
                      <p style="margin:0 0 6px; font-size:14px; font-weight:600; color:#3a3a3a;">Sur Android (Chrome)</p>
                      <ol style="margin:0; padding-left:20px; font-size:13px; color:#4a4a4a; line-height:1.7;">
                        <li>Ouvrez le lien dans <strong>Chrome</strong>.</li>
                        <li>Touchez le menu <strong>⋮</strong> (3 points, en haut à droite).</li>
                        <li>Touchez <strong>« Ajouter à l'écran d'accueil »</strong> ou <strong>« Installer l'application »</strong>.</li>
                        <li>Confirmez en touchant <strong>« Ajouter »</strong> ou <strong>« Installer »</strong>.</li>
                      </ol>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Infos importantes -->
          <tr>
            <td style="padding:16px 28px 8px 28px;">
              <h2 style="margin:0 0 8px; font-size:16px; color:#3a3a3a;">Informations importantes</h2>
              <ul style="margin:0; padding-left:20px; font-size:14px; color:#4a4a4a; line-height:1.8;">
                <li>Votre galerie est sécurisée et accessible uniquement avec votre code personnel.</li>
                <li>Vos photos sont disponibles jusqu'au <strong>${safeExpire}</strong>.</li>
                <li>N'hésitez pas à les télécharger plusieurs fois si besoin.</li>
                <li>Partagez le lien avec vos proches si vous le souhaitez.</li>
              </ul>
            </td>
          </tr>

          <!-- Aide -->
          <tr>
            <td style="padding:16px 28px 24px 28px;">
              <h2 style="margin:0 0 8px; font-size:16px; color:#3a3a3a;">Besoin d'aide ?</h2>
              <p style="margin:0 0 6px; font-size:14px; color:#4a4a4a; line-height:1.6;">
                Si vous rencontrez la moindre difficulté ou avez des questions :
              </p>
              <p style="margin:0; font-size:14px; color:#4a4a4a; line-height:1.8;">
                Email : <a href="mailto:${escapeHtml(CONTACT_EMAIL)}" style="color:#b08d5b;">${escapeHtml(CONTACT_EMAIL)}</a><br/>
                Téléphone : <strong>${escapeHtml(PHONE)}</strong><br/>
                Site : <a href="https://${escapeHtml(WEBSITE)}" style="color:#b08d5b;">${escapeHtml(WEBSITE)}</a><br/>
                Instagram : <a href="${escapeHtml(INSTAGRAM_URL)}" style="color:#b08d5b;">${escapeHtml(INSTAGRAM_HANDLE)}</a>
              </p>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:0 28px 28px 28px; border-top:1px solid #eee5d9;">
              <p style="margin:18px 0 4px; font-size:14px; color:#4a4a4a; line-height:1.6;">
                Avec toute ma gratitude,
              </p>
              <p style="margin:0; font-size:16px; font-weight:600; color:#3a3a3a;">${escapeHtml(SIGNATURE)}</p>
              <p style="margin:2px 0 0 0; font-size:13px; color:#8a7a5e; font-style:italic;">${escapeHtml(TAGLINE)} — ${escapeHtml(REGION)}</p>
              <p style="margin:10px 0 0 0; font-size:13px;">
                <a href="${escapeHtml(INSTAGRAM_URL)}" style="color:#b08d5b; text-decoration:none;">
                  Suivez-moi sur Instagram : ${escapeHtml(INSTAGRAM_HANDLE)}
                </a>
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0; font-size:11px; color:#9a8b75; text-align:center; max-width:600px;">
          Cet email vous est envoyé automatiquement suite à la mise en ligne de votre galerie.
          Si vous n'attendiez pas ce message, vous pouvez l'ignorer.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const body = (req.body || {}) as Partial<SendAlbumEmailBody>;
    const {
      albumCode,
      albumTitle,
      clientEmail,
      photoCount,
      expireAt,
      siteOrigin,
    } = body;

    if (!albumCode || !albumTitle || !clientEmail || !expireAt || !siteOrigin) {
      return res.status(400).json({
        error: 'Champs requis manquants (albumCode, albumTitle, clientEmail, expireAt, siteOrigin).',
      });
    }

    if (typeof photoCount !== 'number' || photoCount < 0) {
      return res.status(400).json({ error: 'photoCount invalide.' });
    }

    // Validation email simple côté serveur
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail.trim())) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || user || 'contact@jg-photographie.fr';
    const replyTo = process.env.MAIL_REPLY_TO || process.env.MAIL_TO || user || 'contact@jg-photographie.fr';

    if (!host || !user || !pass) {
      return res.status(500).json({ error: 'SMTP non configuré côté serveur' });
    }

    // Normalise l'origine (pas de slash final) puis construit l'URL d'accès
    const normalizedOrigin = siteOrigin.replace(/\/+$/, '');
    const accessUrl = `${normalizedOrigin}/acces`;
    const expireFr = formatDateFr(expireAt);

    const data: SendAlbumEmailBody = {
      albumCode,
      albumTitle,
      clientName: body.clientName,
      clientEmail,
      photoCount,
      expireAt,
      category: body.category,
      siteOrigin: normalizedOrigin,
    };

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const subject = buildSubject(albumTitle);
    const text = buildPlainText(data, accessUrl, expireFr);
    const html = buildHtml(data, accessUrl, expireFr);

    await transporter.sendMail({
      from,
      to: clientEmail.trim(),
      subject,
      text,
      html,
      replyTo,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('API send-album-email error:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de l\'envoi du mail' });
  }
}
