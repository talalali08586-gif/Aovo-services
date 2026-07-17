/* ============================================================
   AOVO SERVICES — interactive voiceover hero — page logic
   Renders the 12 service labels and drives the demo popup,
   entirely from the manifest in data/demos.js (loaded before this
   file — see README.md for "how to add a new audio category").
   ============================================================ */

/* ---------- 1) RENDER LABEL COLUMNS FROM THE MANIFEST ---------- */
const colLeft  = document.querySelector('.col-left');
const colRight = document.querySelector('.col-right');
const CURSOR_PATH = 'M6 3l13 7.5-5.6.6 3.1 6.2-2 1-3-6.1L7.5 16z';

function makeLabelButton(demo){
  const btn = document.createElement('button');
  btn.className = 'label';
  btn.dataset.service = demo.slug;

  const txt = document.createElement('span');
  txt.className = 'txt';
  txt.textContent = demo.label;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'cur');
  svg.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', CURSOR_PATH);
  svg.appendChild(path);

  btn.append(txt, svg);
  btn.addEventListener('click', () => openModal(demo.slug, btn));
  return btn;
}

// first half of the manifest renders in the left column, the rest in the
// right column — matches the original 6-left/6-right layout and rebalances
// automatically as categories are added or removed.
const splitAt = Math.ceil(DEMOS.length / 2);
DEMOS.slice(0, splitAt).forEach(d => colLeft.appendChild(makeLabelButton(d)));
DEMOS.slice(splitAt).forEach(d => colRight.appendChild(makeLabelButton(d)));

const DEMO_MAP = Object.fromEntries(DEMOS.map(d => [d.slug, d]));

/* ---------- 2) MODAL / PLAYBACK LOGIC  (no need to edit below) ---------- */
const overlay   = document.getElementById('overlay');
const closeBtn  = document.getElementById('closeBtn');
const mTitle    = document.getElementById('m-title');
const langEn    = document.querySelector('.lang-card.en');
const langAr    = document.querySelector('.lang-card.ar');
const playEn    = document.getElementById('play-en');
const playAr    = document.getElementById('play-ar');
const dlEn      = document.getElementById('dl-en');
const dlAr      = document.getElementById('dl-ar');
const player    = document.getElementById('player');
const npText    = document.getElementById('np-text');
const npBar     = document.getElementById('np-bar');

let current = null;     // current service key
let lastTrigger = null; // button to restore focus to

function resetPlayBtns(){
  [playEn, playAr].forEach(b=>{
    b.classList.remove('playing');
    b.querySelector('path').setAttribute('d','M8 5v14l11-7z'); // play icon
  });
}
function setPauseIcon(btn){
  btn.classList.add('playing');
  btn.querySelector('path').setAttribute('d','M7 5h4v14H7zM13 5h4v14h-4z'); // pause icon
}

// shows/hides a language card depending on whether that language's audio
// exists for this service — missing languages are hidden, not an error.
function setLangCard(card, dlBtn, label, langCode, src){
  if(!src){ card.style.display = 'none'; return; }
  card.style.display = '';
  dlBtn.href = src;
  dlBtn.setAttribute('download', filename(label, langCode, src));
}

function openModal(key, triggerEl){
  const d = DEMO_MAP[key];
  if(!d) return;
  current = key;
  lastTrigger = triggerEl || null;
  mTitle.textContent = d.label;
  setLangCard(langEn, dlEn, d.label, 'EN', d.en);
  setLangCard(langAr, dlAr, d.label, 'AR', d.ar);
  stopAudio();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}
function closeModal(){
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  stopAudio();
  if(lastTrigger) lastTrigger.focus();
}
function filename(label, lang, src){
  const ext = ((src||'').split('?')[0].split('.').pop() || 'mp3').toLowerCase();
  return label.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'-'+lang.toLowerCase()+'.'+ext;
}
function stopAudio(){
  player.pause(); player.removeAttribute('src'); player.load();
  resetPlayBtns(); npText.textContent='Not playing'; npBar.style.width='0%';
}
function playLang(lang){
  const d = DEMO_MAP[current]; if(!d) return;
  const src = d[lang];
  if(!src) return; // language option is hidden, nothing to play
  const btn = (lang==='en') ? playEn : playAr;

  // toggle pause if this track is already playing
  if(btn.classList.contains('playing')){ player.pause(); return; }

  resetPlayBtns();
  player.src = src;
  player.play().then(()=>{
    setPauseIcon(btn);
    npText.textContent = (lang==='en'?'Playing · English':'تشغيل · العربية');
  }).catch(()=>{
    npText.textContent = 'Unable to play this file.';
  });
}

/* events */
playEn.addEventListener('click', ()=> playLang('en'));
playAr.addEventListener('click', ()=> playLang('ar'));
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e=>{ if(e.target===overlay) closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && overlay.classList.contains('open')) closeModal(); });

player.addEventListener('play',  ()=>{ /* state handled in playLang */ });
player.addEventListener('pause', ()=>{ if(player.ended) return; resetPlayBtns(); if(!player.ended) npText.textContent='Paused'; });
player.addEventListener('ended', ()=>{ resetPlayBtns(); npText.textContent='Finished'; npBar.style.width='100%'; });
player.addEventListener('timeupdate', ()=>{
  if(player.duration) npBar.style.width = (player.currentTime/player.duration*100)+'%';
});
