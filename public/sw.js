// Minimal service worker whose only purpose is to make the portal installable
// as a Progressive Web App. It does not cache anything, so requests always hit
// the network and users never see stale content.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Intentionally empty: the browser handles every request normally.
});
