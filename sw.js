// Plattenarchiv – Offline-Speicher.
// Strategie „erst Netz, dann Speicher": ist man online, kommt immer die neueste Version (und wird gemerkt);
// ohne Netz wird die zuletzt gemerkte Version geöffnet. Nur eigene Dateien werden zwischengespeichert,
// Anfragen an Discogs, MusicBrainz, Google usw. gehen immer direkt ins Netz.
const CACHE = "plattenarchiv-app-v1";
const DATEIEN = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-512-maskable.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(DATEIEN.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r, { cache: "no-cache" }).then(antwort => {
      if (antwort && antwort.ok) { const kopie = antwort.clone(); caches.open(CACHE).then(c => c.put(r, kopie)); }
      return antwort;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then(treffer => treffer || (r.mode === "navigate" ? caches.match("index.html") || caches.match("./") : undefined)))
  );
});
