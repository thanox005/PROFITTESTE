/* PROFIT — Service Worker (offline).
   Ao publicar uma nova versão do app, aumente CACHE_VERSION (ex.: profit-v4). */
const CACHE_VERSION = "profit-v14";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/app.css",
  "./js/foods.js",
  "./js/nutrition.js",
  "./js/app.js",
  "./js/navigation.js",
  "./js/engine.js",
  "./js/goals.js",
  "./js/estimativa.js",
  "./js/recomendacao.js",
  "./js/rewards.js",
  "./js/reminders.js",
  "./js/nutrition-ui.js",
  "./js/config.js",
  "./js/sync.js",
  "./js/instalar.js",
  "./js/altura.js",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(
        chaves.filter(c => c !== CACHE_VERSION).map(c => caches.delete(c))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  /* Páginas: tenta a rede (versão nova); sem internet, usa o cache. */
  if(req.mode === "navigate"){
    event.respondWith(
      fetch(req)
        .then(resp => {
          const copia = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put("./index.html", copia));
          return resp;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  /* Demais arquivos: cache primeiro, atualiza em segundo plano. */
  event.respondWith(
    caches.match(req).then(emCache => {
      const rede = fetch(req).then(resp => {
        if(resp && resp.status === 200){
          const copia = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copia));
        }
        return resp;
      }).catch(() => emCache);
      return emCache || rede;
    })
  );
});
