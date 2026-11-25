(function () {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
  var synth = window.speechSynthesis, d = document;
  var voice = null;
  function pickVoice() {
    var v = synth.getVoices() || [];
    voice = v.find(function (x) { return /^fr[-_]FR/i.test(x.lang); }) || v.find(function (x) { return /^fr/i.test(x.lang); }) || null;
  }
  pickVoice();
  if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', pickVoice);

  var SEL = 'h1,h2,h3,h4,p,li,tr,summary,.chain';
  var SKIP = 'nav,.touches,.tts-bar,.tts-go,.pdf,.filt,.bar,.subnav,footer,.back,button,script,style,.fs-btn,.fs-msg,.toast,.pdfbox,.cbox,select,label';
  var RATES = [0.8, 1, 1.2, 1.5];
  var rate = 1;
  try { var r = parseFloat(localStorage.getItem('tts-rate')); if (RATES.indexOf(r) >= 0) rate = r; } catch (e) {}

  function text(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll('.reveal,script,style').forEach(function (x) { x.remove(); });
    if (el.tagName === 'TR') {
      return [].map.call(c.children, function (x) { return x.textContent.trim(); }).filter(Boolean).join(', ');
    }
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function blocks() {
    var root = d.querySelector('.wrap') || d.body;
    return [].filter.call(root.querySelectorAll(SEL), function (el) {
      return !el.closest(SKIP) && !el.querySelector(SEL) && el.offsetParent !== null && text(el);
    });
  }
  function speakable(t) {
    return t.replace(/→/g, ', puis ').replace(/≥/g, ' supérieur ou égal à ').replace(/≤/g, ' inférieur ou égal à ')
      .replace(/</g, ' inférieur à ').replace(/>/g, ' supérieur à ').replace(/↑/g, ' augmentation de ').replace(/↓/g, ' baisse de ')
      .replace(/★/g, '').replace(/\|/g, ', ').replace(/\s+/g, ' ').trim();
  }
  function chunks(t) {
    var out = [], parts = speakable(t).match(/[^.!?;:]+[.!?;:]*\s*/g) || [t];
    var cur = '';
    parts.forEach(function (p) {
      if ((cur + p).length > 220 && cur) { out.push(cur.trim()); cur = ''; }
      cur += p;
    });
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  var list = [], idx = 0, token = 0, state = 'idle';
  var css = d.createElement('style');
  css.textContent =
    '.tts-go{position:fixed;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:30;display:inline-flex;align-items:center;gap:8px;font:700 15px "Source Sans 3",Arial,sans-serif;padding:10px 16px;border-radius:999px;border:none;background:#0e5a58;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.2);cursor:pointer}' +
    '.tts-bar{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:30;max-width:560px;margin:0 auto;display:flex;align-items:center;gap:8px;padding:8px;border-radius:14px;background:#1c2330;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.25);font:600 14px "Source Sans 3",Arial,sans-serif}' +
    '.tts-bar button{font:inherit;font-weight:700;border:none;border-radius:10px;padding:9px 12px;cursor:pointer;background:#2d3541;color:#fff}' +
    '.tts-bar button.main{background:#5cc0bb;color:#0d1716;flex:1}' +
    '.tts-bar .st{flex:none;font-size:13px;color:#c9d1dc;min-width:44px;text-align:center}' +
    '.tts-on{background:#fff3c4!important;color:#1a1a1a!important;border-radius:6px;box-shadow:0 0 0 4px #fff3c4}' +
    '.wrap{padding-bottom:90px}.tts-bar[hidden],.tts-go[hidden]{display:none!important}';
  d.head.appendChild(css);

  var go = d.createElement('button');
  go.type = 'button'; go.className = 'tts-go';
  go.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg><span>Écouter</span>';
  go.setAttribute('aria-label', 'Écouter le texte de la page');

  var bar = d.createElement('div');
  bar.className = 'tts-bar'; bar.hidden = true; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Lecture à voix haute');
  bar.innerHTML = '<button type="button" class="main" data-a="pp">Pause</button><button type="button" data-a="rate"></button><span class="st" aria-live="polite"></span><button type="button" data-a="stop" aria-label="Arrêter la lecture">Arrêter</button>';
  var bPP = bar.querySelector('[data-a=pp]'), bRate = bar.querySelector('[data-a=rate]'), st = bar.querySelector('.st');
  function showRate() { bRate.textContent = String(rate).replace('.', ',') + ' ×'; }
  showRate();

  function mark() {
    d.querySelectorAll('.tts-on').forEach(function (x) { x.classList.remove('tts-on'); });
    var el = list[idx];
    if (el) {
      el.classList.add('tts-on');
      try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { el.scrollIntoView(); }
    }
    st.textContent = list.length ? (idx + 1) + '/' + list.length : '';
  }
  function play() {
    var my = ++token;
    synth.cancel();
    if (idx >= list.length) { stop(); return; }
    state = 'play'; bPP.textContent = 'Pause'; mark();
    var parts = chunks(text(list[idx])), k = 0;
    function next() {
      if (my !== token) return;
      if (k >= parts.length) { idx++; play(); return; }
      var u = new SpeechSynthesisUtterance(parts[k++]);
      u.lang = 'fr-FR'; if (voice) u.voice = voice; u.rate = rate;
      u.onend = next;
      u.onerror = function (e) { if (my === token && e.error !== 'interrupted' && e.error !== 'canceled') next(); };
      synth.speak(u);
    }
    next();
  }
  function pause() { token++; synth.cancel(); state = 'pause'; bPP.textContent = 'Reprendre'; }
  function stop() {
    token++; synth.cancel(); state = 'idle';
    d.querySelectorAll('.tts-on').forEach(function (x) { x.classList.remove('tts-on'); });
    bar.hidden = true; go.hidden = false;
  }
  function firstVisible() {
    for (var i = 0; i < list.length; i++) { var r = list[i].getBoundingClientRect(); if (r.bottom > 60) return i; }
    return 0;
  }
  go.addEventListener('click', function () {
    list = blocks();
    if (!list.length) return;
    idx = firstVisible();
    go.hidden = true; bar.hidden = false;
    play();
  });
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.dataset.a;
    if (a === 'pp') { if (state === 'play') pause(); else play(); }
    else if (a === 'stop') stop();
    else if (a === 'rate') {
      rate = RATES[(RATES.indexOf(rate) + 1) % RATES.length]; showRate();
      try { localStorage.setItem('tts-rate', String(rate)); } catch (e2) {}
      if (state === 'play') play();
    }
  });
  // Pendant la lecture, toucher un paragraphe relance la lecture à partir de lui.
  d.addEventListener('click', function (e) {
    if (state === 'idle' || e.target.closest('.tts-bar,a,button,summary,input,select')) return;
    var el = e.target.closest(SEL); if (!el) return;
    var i = list.indexOf(el);
    if (i < 0) { list = blocks(); i = list.indexOf(el); }
    if (i >= 0) { idx = i; play(); }
  });
  d.addEventListener('visibilitychange', function () { if (d.hidden && state === 'play') pause(); });
  window.addEventListener('pagehide', function () { token++; synth.cancel(); });
  function mount() { d.body.appendChild(go); d.body.appendChild(bar); }
  if (d.body) mount(); else d.addEventListener('DOMContentLoaded', mount);
})();
