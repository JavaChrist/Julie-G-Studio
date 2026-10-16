import { BRAND, emailButton, escapeHtml, renderBrandedEmail } from './brandedEmail';

export interface AlbumEmailData {
  albumCode: string;
  albumTitle: string;
  clientName?: string;
  clientEmail: string;
  photoCount: number;
  expireAt: string;
  category?: string;
  siteOrigin: string;
}

export function formatDateFr(iso: string): string {
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

function greeting(clientName?: string): { text: string; html: string } {
  const name = clientName?.trim();
  if (!name) return { text: 'Bonjour,', html: 'Bonjour,' };
  return { text: `Bonjour ${name},`, html: `Bonjour ${escapeHtml(name)},` };
}

export function buildAlbumSubject(albumTitle: string): string {
  return `Vos photos sont prêtes — ${albumTitle}`;
}

export function buildAlbumPlainText(data: AlbumEmailData, accessUrl: string, expireFr: string): string {
  const hello = greeting(data.clientName).text;

  return `${hello}

C'est avec un grand plaisir que je vous annonce que vos photos sont maintenant disponibles dans votre galerie privée.

${data.albumTitle}

ACCÈS À VOS PHOTOS
1) Rendez-vous sur : ${accessUrl}
2) Entrez votre code d'accès personnel : ${data.albumCode}
3) Découvrez et téléchargez toutes vos photos

VOTRE GALERIE CONTIENT
- ${data.photoCount} photos haute définition sélectionnées avec soin
- Retouches professionnelles appliquées
- Format numérique prêt à imprimer
- Téléchargement illimité jusqu'au ${expireFr}

INSTALLER L'APPLICATION SUR VOTRE TÉLÉPHONE
iPhone (Safari)
1) Ouvrez le lien ${accessUrl} dans Safari
2) Appuyez sur l'icône Partager (carré avec une flèche vers le haut)
3) Touchez « Sur l'écran d'accueil »
4) Touchez « Ajouter »

Android (Chrome)
1) Ouvrez le lien ${accessUrl} dans Chrome
2) Appuyez sur le menu (3 points)
3) Touchez « Ajouter à l'écran d'accueil » ou « Installer l'application »
4) Confirmez

Vos photos restent disponibles jusqu'au ${expireFr}.
La galerie est accessible uniquement avec votre code personnel.

Besoin d'aide ?
${BRAND.emailPro}
${BRAND.phone}
${BRAND.websiteLabel}

${BRAND.signature}
${BRAND.tagline}
${BRAND.region}
`;
}

export function buildAlbumHtml(data: AlbumEmailData, accessUrl: string, expireFr: string): string {
  const hello = greeting(data.clientName).html;
  const safeCode = escapeHtml(data.albumCode);
  const safeUrl = escapeHtml(accessUrl);
  const safeTitle = escapeHtml(data.albumTitle);
  const safePhotoCount = escapeHtml(data.photoCount);
  const safeExpire = escapeHtml(expireFr);

  const content = `
    <p style="margin:0 0 8px; font-size:16px;">${hello}</p>
    <p style="margin:0 0 18px;">
      C'est avec un grand plaisir que je vous annonce que vos photos sont maintenant
      disponibles dans votre galerie privée.
    </p>
    <p style="margin:0 0 18px; font-size:18px; font-weight:600; text-align:center;">${safeTitle}</p>
    ${emailButton(accessUrl, 'Voir mes photos')}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0; background:${BRAND.white}; border:1px solid #EADFD4; border-radius:12px;">
      <tr>
        <td style="padding:20px; text-align:center;">
          <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:${BRAND.taupe};">Votre code d'accès</p>
          <p style="margin:0; font-family:'Courier New', Courier, monospace; font-size:22px; font-weight:700; letter-spacing:3px; color:${BRAND.charcoal};">${safeCode}</p>
          <p style="margin:12px 0 0; font-size:13px; color:${BRAND.taupe};">
            À saisir sur
            <a href="${safeUrl}" style="color:${BRAND.primaryDark}; word-break:break-all;">${safeUrl}</a>
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px; font-size:16px; font-weight:600;">Votre galerie contient</p>
    <ul style="margin:0 0 18px; padding-left:20px;">
      <li>${safePhotoCount} photos haute définition sélectionnées avec soin</li>
      <li>Retouches professionnelles appliquées</li>
      <li>Format numérique prêt à imprimer</li>
      <li>Téléchargement illimité jusqu'au <strong>${safeExpire}</strong></li>
    </ul>
    <p style="margin:0 0 8px; font-size:16px; font-weight:600;">Sur votre téléphone</p>
    <p style="margin:0 0 12px; font-size:14px; color:#4a403c;">
      Ajoutez la galerie à l'écran d'accueil : c'est gratuit et vous y revenez en un geste.
    </p>
    <p style="margin:0 0 4px; font-size:14px; font-weight:600;">iPhone (Safari)</p>
    <ol style="margin:0 0 12px; padding-left:20px; font-size:14px;">
      <li>Ouvrez le lien dans Safari.</li>
      <li>Touchez l'icône Partager.</li>
      <li>Touchez « Sur l'écran d'accueil », puis « Ajouter ».</li>
    </ol>
    <p style="margin:0 0 4px; font-size:14px; font-weight:600;">Android (Chrome)</p>
    <ol style="margin:0 0 8px; padding-left:20px; font-size:14px;">
      <li>Ouvrez le lien dans Chrome.</li>
      <li>Touchez le menu ⋮.</li>
      <li>Touchez « Ajouter à l'écran d'accueil » ou « Installer l'application ».</li>
    </ol>
  `;

  return renderBrandedEmail({
    title: 'Vos photos sont prêtes',
    preheader: `Votre galerie « ${data.albumTitle} » est en ligne. Code : ${data.albumCode}`,
    contentHtml: content,
    footerNote:
      "Cet email vous est envoyé suite à la mise en ligne de votre galerie. Si vous n'attendiez pas ce message, vous pouvez l'ignorer.",
  });
}
