/* Service worker de Journey: notificaciones push y funcionamiento sin internet. */
const VERSION = "journey-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((c) => c.addAll(["/", "/entreno", "/nutricion", "/progreso", "/mas"]).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Fotos de ejercicios y archivos estáticos: primero caché
  if (url.pathname.startsWith("/exercises/") || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Páginas: primero red, si no hay internet usa la copia guardada
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/")) || Response.error()),
    );
  }
});

// ── Notificaciones ─────────────────────────────────────

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Journey", body: event.data ? event.data.text() : "" };
  }
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    tag: data.tag || "journey",
    renotify: true,
    data,
    vibrate: [120, 60, 120],
  };
  if (data.actions && data.itemId !== "test") {
    options.actions = [
      { action: "done", title: "✅ Hecho" },
      { action: "snooze", title: "⏰ En 15 min" },
    ];
  }
  event.waitUntil(self.registration.showNotification(data.title || "Journey", options));
});

self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data || {};
  event.notification.close();

  if (event.action === "done") {
    event.waitUntil(
      fetch("/api/push/done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: data.deviceId, date: data.date, itemId: data.itemId }),
      }).catch(() => {}),
    );
    return;
  }
  if (event.action === "snooze") {
    event.waitUntil(
      fetch("/api/push/snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: data.deviceId,
          itemId: data.itemId,
          title: data.title,
          body: data.body,
          url: data.url,
          minutes: 15,
        }),
      }).catch(() => {}),
    );
    return;
  }

  const target = data.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(target).catch(() => {});
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
