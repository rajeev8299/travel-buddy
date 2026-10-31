// TravelOnBuddy Service Worker
// Cache version: bump when updating core shell assets
const CACHE_NAME = "tob-cache-v1";

// Static app shell resources to pre-cache on install
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png",
  "./logo.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./offline.html"
];

// Install event: cache the critical app shell and offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Log error but don't fail installation if non-critical asset fails
        console.warn("[SW] Pre-caching warning:", err);
      })
  );
});

// Activate event: clean up stale legacy caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event: safe caching strategy
// 1. NEVER cache authenticated API requests (/api/*, cookies, or mutation methods)
// 2. HTML navigation: Network-first, fallback to cache, fallback to offline.html
// 3. Static assets (images, fonts, scripts, css): Stale-while-revalidate / cache-first
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // Strictly skip API routes to protect fresh data and credentials
  if (url.pathname.includes("/api/") || url.pathname.includes("/auth/")) {
    return;
  }

  // Navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlinePage = await caches.match("./offline.html");
          if (offlinePage) {
            return offlinePage;
          }
          return new Response("Offline — please check your internet connection.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

