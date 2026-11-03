(function(){
  if('serviceWorker' in navigator){
    var had=!!navigator.serviceWorker.controller, done=false;
    navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){ function u(){ if(navigator.onLine) r.update().catch(function(){}); } u(); addEventListener('online',u); document.addEventListener('visibilitychange',function(){ if(!document.hidden) u(); }); }).catch(function(){});
    navigator.serviceWorker.addEventListener('controllerchange',function(){ if(had&&!done){done=true;location.reload();} });
  }
  var b=document.createElement('div');
  b.textContent='Hors connexion';
  b.style.cssText='position:fixed;left:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:60;padding:6px 10px;border-radius:999px;background:#9a4a12;color:#fff;font:600 13px sans-serif';
  function s(){ b.hidden=navigator.onLine; b.style.display=navigator.onLine?'none':'block'; }
  addEventListener('online',s); addEventListener('offline',s);
  document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(b);s();});
})();
