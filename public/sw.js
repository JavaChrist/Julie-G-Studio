// Service Worker optimisé pour Julie Grohens Photographe
const CACHE_NAME = 'julie-grohens-v2';

self.addEventListener('install', event => {
  console.log('[SW] Service Worker installé - v2');
  // Forcer l'activation immédiate du nouveau service worker
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Service Worker activé - v2');
  // Prendre le contrôle de tous les clients immédiatement
  event.waitUntil(self.clients.claim());
});

// Gestionnaire fetch modifié pour éviter les problèmes CORS
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignorer complètement les requêtes vers Firebase Storage et googleapis
  // pour éviter les problèmes CORS lors des téléchargements
  if (
    request.url.includes('firebasestorage.googleapis.com') ||
    request.url.includes('firebase.googleapis.com') ||
    request.url.includes('googleapis.com') ||
    request.mode === 'cors' ||
    request.method !== 'GET'
  ) {
    // Ne pas intercepter ces requêtes, laisser le navigateur les gérer
    console.log('[SW] Ignoring Firebase Storage request:', request.url);
    return;
  }

  // Pour les autres requêtes (ressources locales), les gérer normalement
  event.respondWith(
    fetch(request).catch(error => {
      console.log('[SW] Fetch failed for:', request.url, error);
      // En cas d'échec, ne pas bloquer la requête
      return fetch(request);
    })
  );
});
