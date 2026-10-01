/* Service worker: guarda o app no aparelho para funcionar sem internet.
   Ao publicar uma nova versão, altere VERSAO abaixo. */
const VERSAO = 'conferencia-v4';
const ARQUIVOS = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/icon-512-maskable.png",
    "./icons/apple-touch-icon.png",
    "./ocr/tesseract.min.js",
    "./ocr/worker.min.js",
    "./ocr/tesseract-core-simd-lstm.wasm.js",
    "./ocr/tesseract-core-lstm.wasm.js",
    "./ocr/lang/por.traineddata.gz"
  ];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSAO)
      .then(c => c.addAll(ARQUIVOS.map(u => new Request(u, {cache: 'reload'}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Primeiro o que está guardado no aparelho; se não houver, busca na rede. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(r =>
      r || fetch(e.request).catch(() =>
        e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
