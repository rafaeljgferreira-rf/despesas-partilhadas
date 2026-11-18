const CACHE = 'a-nossa-casa-shell-v3';
const ASSETS = ['/index.html','/supabase.js','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/icons/icon-maskable-192.png','/icons/icon-maskable-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(p => new Request(p,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('a-nossa-casa-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e=>{
 const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin)return;
 if(r.mode==='navigate'||u.pathname==='/index.html'||u.pathname==='/manifest.webmanifest'){
  const key=u.pathname==='/manifest.webmanifest'?'/manifest.webmanifest':'/index.html';
  e.respondWith(fetch(r,{cache:'no-cache'}).then(async res=>{if(res.ok){const copy=res.clone();try{await (await caches.open(CACHE)).put(key,copy)}catch(_){}}return res}).catch(async()=>await (await caches.open(CACHE)).match(key)||Response.error()));return;
 }
 if(ASSETS.includes(u.pathname))e.respondWith(caches.open(CACHE).then(async c=>await c.match(u.pathname)||fetch(r)));
});
