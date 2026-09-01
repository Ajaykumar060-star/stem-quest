/*
 * STEM Quest - Service Worker
 *
 * Provides offline support by precaching all app shell files so the PWA
 * works even without a network connection - a core requirement for reaching
 * students in rural areas with unreliable connectivity.
 */

var CACHE_NAME = 'stem-quest-v1';
var APP_SHELL = [
  './',
  './index.html',
  './css/main.css',
  './public/auth.js',
  './public/data-store.js',
  './public/manifest.json',
  './public/favicon.ico',
  './pages/student_login.html',
  './pages/student_dashboard.html',
  './pages/student_profile.html',
  './pages/game_selection.html',
  './pages/game_interface.html',
  './pages/progress_tracking.html'
];

// Install: pre-cache the app shell so the app loads offline.
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_SHELL);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

// Activate: clean up old caches.
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.filter(function (key) {
            return key !== CACHE_NAME;
          }).map(function (key) {
            return caches.delete(key);
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

// Fetch: serve from cache first (offline), fall back to network, then cache.
self.addEventListener('fetch', function (event) {
  // Only handle GET requests for same-origin resources.
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(function (cached) {
        if (cached) return cached;
        return fetch(event.request)
          .then(function (response) {
            // Cache successful responses for later offline use.
            if (response && response.status === 200 && response.type === 'basic') {
              var clone = response.clone();
              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(function () {
            // Fall back to the login page for navigations when offline.
            if (event.request.mode === 'navigate') {
              return caches.match('./pages/student_login.html');
            }
          });
      })
  );
});
