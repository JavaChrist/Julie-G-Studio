import { BRAND, emailButton, escapeHtml, renderBrandedEmail } from './brandedEmail';

export function buildPasswordResetSubject(): string {
  return 'Réinitialiser votre mot de passe — Julie Grohens';
}

export function buildPasswordResetPlainText(resetUrl: string): string {
  return `Bonjour,

Vous avez demandé à réinitialiser le mot de passe de votre espace Julie Grohens.

Choisissez un nouveau mot de passe en ouvrant ce lien :
${resetUrl}

Ce lien est valable pendant une heure. S'il a expiré, refaites une demande depuis la page de connexion.

Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste inchangé.

${BRAND.signature}
${BRAND.tagline}
${BRAND.websiteLabel}
`;
}

export function buildPasswordResetHtml(resetUrl: string): string {
  const safeUrl = escapeHtml(resetUrl);
  const content = `
    <p style="margin:0 0 8px; font-size:16px;">Bonjour,</p>
    <p style="margin:0 0 18px;">
      Vous avez demandé à réinitialiser le mot de passe de votre espace
      <strong>Julie Grohens</strong>.
    </p>
    ${emailButton(resetUrl, 'Choisir un nouveau mot de passe')}
    <p style="margin:18px 0 0; font-size:13px; line-height:1.6; color:${BRAND.taupe}; word-break:break-all;">
      Si le bouton ne s'ouvre pas, copiez ce lien dans votre navigateur :<br/>
      <a href="${safeUrl}" style="color:${BRAND.primaryDark};">${safeUrl}</a>
    </p>
    <p style="margin:18px 0 0; font-size:14px;">
      Ce lien est valable pendant une heure. Passé ce délai, refaites une demande depuis la page de connexion.
    </p>
    <p style="margin:12px 0 0; font-size:14px;">
      Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste inchangé.
    </p>
  `;

  return renderBrandedEmail({
    title: 'Réinitialiser votre mot de passe',
    preheader: 'Lien pour choisir un nouveau mot de passe, valable une heure.',
    contentHtml: content,
    footerNote:
      "Cet email vous est envoyé parce qu'une réinitialisation a été demandée pour cette adresse.",
  });
}
