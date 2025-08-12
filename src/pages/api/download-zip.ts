import type { NextApiRequest, NextApiResponse } from 'next';
import archiver from 'archiver';
import https from 'https';
import http from 'http';

type ReqBody = {
  title?: string;
  urls?: string[];
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { title = 'album', urls = [] } = (req.body || {}) as ReqBody;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Aucune URL fournie' });
    }

    const safeTitle = String(title).replace(/[^a-zA-Z0-9-_]/g, '_');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.zip"`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      try { res.status(500).end('Erreur archive'); } catch { }
    });
    archive.pipe(res);

    const fetchStream = (urlStr: string): Promise<NodeJS.ReadableStream> => new Promise((resolve, reject) => {
      try {
        const urlObj = new URL(urlStr);
        const client = urlObj.protocol === 'https:' ? https : http;
        const req = client.get(urlObj, { headers: { 'User-Agent': 'NodeZip/1.0' } }, (resp) => {
          if (resp.statusCode && resp.statusCode >= 400) {
            reject(new Error(`HTTP ${resp.statusCode}`));
          } else {
            resolve(resp);
          }
        });
        req.on('error', reject);
      } catch (e) {
        reject(e);
      }
    });

    let index = 0;
    for (const url of urls) {
      index += 1;
      let fileName = `${safeTitle}-photo-${index}.jpg`;
      try {
        const u = new URL(url);
        const last = decodeURIComponent(u.pathname.split('/').pop() || '');
        if (last) fileName = `${safeTitle}-${last}`;
      } catch { }

      try {
        const stream = await fetchStream(url);
        archive.append(stream, { name: fileName });
      } catch (e) {
        console.warn('Skip URL (server):', url, e);
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}


