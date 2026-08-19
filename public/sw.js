const CACHE_NAME = "storyweaver-v1";
const STATIC_ASSETS = ["/", "/discover", "/manifest.json", "/favicon.ico"];
const CHAPTER_CACHE_PREFIX = "chapter:";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-HTTP(S) schemes.
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // Cache chapter pages for offline reading.
  if (url.pathname.startsWith("/chapters/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // Static assets: cache-first.
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  // Everything else: network-first with offline fallback to root shell.
  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return (
        (await cache.match(request)) ||
        (await cache.match("/")) ||
        new Response("Offline", { status: 503 })
      );
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_CHAPTER") {
    const { slug, html } = event.data;
    caches.open(CACHE_NAME).then((cache) => {
      const request = new Request(`/chapters/${slug}`);
      const response = new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
      cache.put(request, response);
    });
  }
});
