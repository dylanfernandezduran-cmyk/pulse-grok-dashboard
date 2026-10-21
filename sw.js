// v2 · Service worker sin caché: nunca sirve contenido viejo. Todo va a la red.
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===self.location.origin)e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>fetch(e.request)))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow('./senales.html')))});
