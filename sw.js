const V='diu-ac4b36678cb0',FONTS='diu-fonts',F=["./", "calcul-1b.html", "cas-interdossier.html", "cas-revision.html", "cas.html", "coronaire.html", "cours.html", "eval-ger-fiche.html", "eval-ger.html", "fiche-1b.html", "fiche.html", "hypotension.html", "index.html", "notes.html", "programme.html", "stemi-cas.html", "stemi-fiche.html", "stemi.html", "transcription.html", "vieillissement-cas.html", "vieillissement-fiche.html", "vieillissement.html", "style.css", "fs.js", "pwa.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==FONTS).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin==='https://fonts.googleapis.com'||u.origin==='https://fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}))).catch(()=>new Response('',{status:503})));return;
  }
  if(u.origin!==location.origin)return;
  e.respondWith(caches.open(V).then(c=>c.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).catch(()=>c.match('index.html')))));
});
