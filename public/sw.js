const CACHE_NAME = 'noti-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/globals.css',
  '/_next/static/css/app.css',
  '/_next/static/js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // For Firebase API calls
  if (event.request.url.includes('firebaseio.com') || event.request.url.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If offline, try to get from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For other requests
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((response) => {
              // Clone the response before caching
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            });
        })
    );
  }
}); 