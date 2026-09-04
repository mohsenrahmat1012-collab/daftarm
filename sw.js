/* دفتر پرونده‌ها — service worker
   راهبرد: cache-first با به‌روزرسانی در پس‌زمینه.
   پس از اولین بازدید، برنامه بدون اینترنت هم باز می‌شود؛ نسخهٔ تازه در
   پس‌زمینه دانلود و در باز شدن بعدی اعمال می‌شود. */
var CACHE = "daftar-cache-v1";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(["./", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"]).catch(function(){});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        try {
          if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
            var cp = res.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
          }
        } catch (err) {}
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
