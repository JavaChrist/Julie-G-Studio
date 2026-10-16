import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from '../../lib/firebaseAdmin';
import { sendBrandedMail } from '../../lib/mail/brandedEmail';
import { buildPasswordResetHtml, buildPasswordResetPlainText, buildPasswordResetSubject } from '../../lib/mail/passwordResetEmail';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_ORIGINS = [
  'https://jg-photographie.fr',
  'https://www.jg-photographie.fr',
];

function resolvePublicOrigin(req: NextApiRequest): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
  const host = req.headers.host || '';
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || 'https';
  const requestOrigin = host ? `${proto}://${host}` : '';

  const allowed = new Set(
    [...ALLOWED_ORIGINS, configured].filter(Boolean).map((origin) => origin.replace(/\/+$/, ''))
  );

  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)) {
    return requestOrigin;
  }

  if (requestOrigin && allowed.has(requestOrigin)) return requestOrigin;
  if (configured) return configured;
  return 'https://www.jg-photographie.fr';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const email = String((req.body || {}).email || '').trim();
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }

    if (!isFirebaseAdminConfigured()) {
      return res.status(500).json({
        error: "L'envoi personnalisé n'est pas encore configuré (clé Firebase Admin manquante).",
      });
    }

    const origin = resolvePublicOrigin(req);
    const auth = getFirebaseAdminAuth();

    let resetUrl: string;
    try {
      const firebaseLink = await auth.generatePasswordResetLink(email);
      const oobCode = new URL(firebaseLink).searchParams.get('oobCode');
      if (!oobCode) {
        throw new Error('Lien de réinitialisation incomplet');
      }
      resetUrl = `${origin}/auth/nouveau-mot-de-passe?oobCode=${encodeURIComponent(oobCode)}`;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        return res.status(200).json({ ok: true });
      }
      throw error;
    }

    await sendBrandedMail({
      to: email,
      subject: buildPasswordResetSubject(),
      text: buildPasswordResetPlainText(resetUrl),
      html: buildPasswordResetHtml(resetUrl),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('API send-password-reset error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message === 'SMTP non configuré côté serveur' || message === 'Firebase Admin non configuré') {
      return res.status(500).json({ error: message });
    }
    return res.status(500).json({ error: "Erreur serveur lors de l'envoi du mail" });
  }
}
