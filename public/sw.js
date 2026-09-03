// Safe Service Worker for iOS Safari & Android Compatibility
const CACHE_NAME = 'gvd-skyline-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

// Network-first fetch strategy for maximum reliability on iOS Safari
self.addEventListener('fetch', (event) => {
  // Let browser handle all requests naturally without blocking iOS WebKit
  return;
});
