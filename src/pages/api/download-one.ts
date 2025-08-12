import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import http from 'http';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { url, filename } = req.query as { url?: string; filename?: string };
    if (!url) return res.status(400).json({ error: 'Paramètre url requis' });
    const safeName = (filename || 'photo').toString().replace(/[^a-zA-Z0-9-_.]/g, '_');

    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

    const request = client.get(urlObj, { headers: { 'User-Agent': 'NodeProxy/1.0' } }, (resp) => {
      if ((resp.statusCode || 500) >= 400) {
        res.status(resp.statusCode || 500).end('Erreur de téléchargement');
        return;
      }
      resp.pipe(res);
    });
    request.on('error', (e) => {
      console.error('Proxy error:', e);
      res.status(500).end('Erreur serveur');
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}


