(function(){
  // Bouton « Accueil » toujours visible, en haut à gauche, sur chaque page de cours.
  var d=document;
  if(d.querySelector('.back-fab')) return;
  var s=d.createElement('style');
  s.textContent='.back.back-fab{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:12px;z-index:50;display:inline-flex;align-items:center;gap:6px;margin:0;padding:7px 13px 7px 10px;border-radius:999px;border:1px solid var(--line,#d6dbe1);background:var(--surface,#fff);color:var(--accent,#0f6e6a);font:700 14px "Source Sans 3",Arial,sans-serif;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.12)}'+
    '.back.back-fab:hover,.back.back-fab:focus-visible{border-color:var(--accent,#0f6e6a);text-decoration:none;outline:none}'+
    'body{padding-top:48px!important}'+
    '@media print{.back.back-fab{display:none!important}body{padding-top:0!important}}';
  d.head.appendChild(s);
  var a=d.createElement('a');
  a.className='back back-fab'; a.href='index.html'; a.setAttribute('aria-label','Retour à l\'accueil');
  a.innerHTML='<span aria-hidden="true">←</span><span>Accueil</span>';
  (d.body||d.documentElement).appendChild(a);
})();
