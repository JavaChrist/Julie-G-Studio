// Service Worker minimal pour Julie Grohens Photographe.
//
// Volontairement passif: on s'enregistre uniquement pour rendre l'app
// éligible à l'installation PWA, et on laisse le navigateur gérer toutes
// les requêtes nativement. Pas d'interception fetch — donc plus de
// fausses réponses 504 lors des Fast Refresh de Next.js, plus de soucis
// de promesses rejetées non gérées, plus d'effets de bord en dev.
//
// Si on veut un jour ajouter du cache offline, le faire AVEC précaution:
//   - Ne jamais intercepter les navigations HTML
//   - Toujours laisser passer les requêtes cross-origin
//   - Ne jamais renvoyer de réponse synthétique d'erreur

const CACHE_NAME = 'julie-grohens-v4';

self.addEventListener('install', () => {
  console.log('[SW] Service Worker installé - v4 (passif)');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Service Worker activé - v4 (passif)');
  event.waitUntil(
    (async () => {
      // Nettoyer les anciens caches éventuels (v1, v2, v3) au cas où.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Pas de listener 'fetch': comportement par défaut du navigateur.
