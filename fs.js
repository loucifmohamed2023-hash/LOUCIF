(function(){
  var d=document, el=d.documentElement;
  // Page chargée dans le cadre plein écran : pas de second bouton.
  if(window.name==='fsframe') return;
  var req=el.requestFullscreen||el.webkitRequestFullscreen;
  var exit=d.exitFullscreen||d.webkitExitFullscreen;
  var cur=function(){return d.fullscreenElement||d.webkitFullscreenElement;};
  var frame=null;
  var b=d.createElement('button');
  b.type='button'; b.className='fs-btn';
  function label(){var on=!!cur(); b.textContent=on?'✕ Fermer':'⛶ Plein écran'; b.setAttribute('aria-label',on?'Quitter le plein écran':'Passer en plein écran'); b.classList.toggle('on',on);}
  function msg(t){var m=d.createElement('div');m.className='fs-msg';m.textContent=t;d.body.appendChild(m);setTimeout(function(){m.remove();},4000);}
  function openFrame(url){
    if(!frame){frame=d.createElement('iframe');frame.name='fsframe';frame.className='fs-frame';frame.title='Application';d.body.appendChild(frame);}
    frame.src=url;
  }
  function onChange(){
    label();
    if(!cur() && frame){
      // Sortie du plein écran : rester sur la page consultée.
      var u=null; try{u=frame.contentWindow.location.href;}catch(e){}
      frame.remove(); frame=null;
      if(u && u!==location.href) location.href=u;
    }
  }
  b.addEventListener('click',function(){
    try{
      if(cur()){ exit.call(d); }
      else if(req){ var p=req.call(el); if(p&&p.catch)p.catch(function(){msg('Plein écran refusé par cette application. Ouvrez l\'app dans Chrome.');}); }
      else msg('Plein écran indisponible ici. Ouvrez l\'app dans Chrome.');
    }catch(e){msg('Plein écran indisponible ici. Ouvrez l\'app dans Chrome.');}
  });
  // En plein écran, les liens internes s'ouvrent dans le cadre : le plein écran reste actif.
  d.addEventListener('click',function(e){
    if(!cur()) return;
    var a=e.target.closest && e.target.closest('a[href]'); if(!a) return;
    var u=new URL(a.getAttribute('href'),location.href);
    if(u.origin!==location.origin) return;
    if(u.pathname===location.pathname) return;
    e.preventDefault(); openFrame(u.href);
  });
  d.addEventListener('fullscreenchange',onChange); d.addEventListener('webkitfullscreenchange',onChange);
  label(); (d.body||el).appendChild(b);
})();
