import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

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
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.MAIL_TO || user;
    const from = process.env.MAIL_FROM || user || 'no-reply@julie-g-studio.com';

    if (!host || !user || !pass) {
      return res.status(500).json({ error: 'SMTP non configuré côté serveur' });
    }

    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

    const subject = `Nouveau message du site - ${name}`;
    const text = `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const html = `
      <h2>Nouveau message du site</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr/>
      <p style="white-space: pre-wrap;">${message}</p>
    `;

    await transporter.sendMail({ from, to, subject, text, html, replyTo: email });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('API contact error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}


