import type { NextApiRequest, NextApiResponse } from 'next';
import {
  buildAlbumHtml,
  buildAlbumPlainText,
  buildAlbumSubject,
  formatDateFr,
  type AlbumEmailData,
} from '../../lib/mail/albumEmail';
import { sendBrandedMail } from '../../lib/mail/brandedEmail';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const body = (req.body || {}) as Partial<AlbumEmailData>;
    const { albumCode, albumTitle, clientEmail, photoCount, expireAt, siteOrigin } = body;

    if (!albumCode || !albumTitle || !clientEmail || !expireAt || !siteOrigin) {
      return res.status(400).json({
        error: 'Champs requis manquants (albumCode, albumTitle, clientEmail, expireAt, siteOrigin).',
      });
    }

    if (typeof photoCount !== 'number' || photoCount < 0) {
      return res.status(400).json({ error: 'photoCount invalide.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail.trim())) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }

    const normalizedOrigin = siteOrigin.replace(/\/+$/, '');
    const accessUrl = `${normalizedOrigin}/acces`;
    const expireFr = formatDateFr(expireAt);

    const data: AlbumEmailData = {
      albumCode,
      albumTitle,
      clientName: body.clientName,
      clientEmail,
      photoCount,
      expireAt,
      category: body.category,
      siteOrigin: normalizedOrigin,
    };

    await sendBrandedMail({
      to: clientEmail.trim(),
      subject: buildAlbumSubject(albumTitle),
      text: buildAlbumPlainText(data, accessUrl, expireFr),
      html: buildAlbumHtml(data, accessUrl, expireFr),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('API send-album-email error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message === 'SMTP non configuré côté serveur') {
      return res.status(500).json({ error: message });
    }
    return res.status(500).json({ error: "Erreur serveur lors de l'envoi du mail" });
  }
}
