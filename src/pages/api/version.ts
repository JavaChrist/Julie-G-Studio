import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Version du déploiement en cours.
 *
 * Sur Vercel, chaque commit produit un déploiement avec un SHA unique : les
 * pages ouvertes comparent ce SHA à celui embarqué au chargement pour savoir
 * qu'une mise à jour est disponible.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
  });
}
