/* ============================================================
   AOVO SERVICES — Audio Services page demo players
   Reads the separate page manifest and builds the same gold Play,
   Download, and seek controls used by the Home-page sample popup.
   Audio paths remain in data/audio-services-demos.js, never in this
   page's HTML or JavaScript.
   ============================================================ */
const audioServiceDemoMap = Object.fromEntries(
  AUDIO_SERVICE_DEMOS.map(demo => [demo.slug, demo])
);

let activeDemoAudio = null;

function makePlayIcon(){
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M8 5v14l11-7z');
  svg.appendChild(path);
  return svg;
}

function setDemoSeekFill(seek, percent){
  seek.value = percent;
  seek.style.background = `linear-gradient(90deg,var(--gold) ${percent}%,rgba(216,178,90,.18) ${percent}%)`;
}

document.querySelectorAll('[data-audio-service-demo]').forEach(container => {
  const demo = audioServiceDemoMap[container.dataset.audioServiceDemo];
  if (!demo || !demo.en) return;

  const label = document.createElement('span');
  label.className = 'audio-service-demo-label';
  label.textContent = 'Sample demo';

  const player = document.createElement('audio');
  player.preload = 'none';
  player.src = demo.en;

  const play = document.createElement('button');
  play.className = 'btn btn-play';
  play.type = 'button';
  play.setAttribute('aria-label', `Play ${demo.slug.replace(/-/g, ' ')} sample`);
  play.append(makePlayIcon(), document.createTextNode('Play'));

  const download = document.createElement('a');
  download.className = 'btn btn-dl';
  download.href = demo.en;
  download.download = `${demo.slug}-en.mp3`;
  download.textContent = 'Download';

  const nowPlaying = document.createElement('div');
  nowPlaying.className = 'nowplaying';
  const status = document.createElement('span');
  status.textContent = 'Not playing';
  const seek = document.createElement('input');
  seek.className = 'seek';
  seek.type = 'range';
  seek.min = '0';
  seek.max = '100';
  seek.step = '0.1';
  seek.value = '0';
  seek.disabled = true;
  seek.setAttribute('aria-label', `Seek ${demo.slug.replace(/-/g, ' ')} sample`);
  nowPlaying.append(status, seek);

  function showPlayState(isPlaying){
    const path = play.querySelector('path');
    play.classList.toggle('playing', isPlaying);
    play.lastChild.nodeValue = isPlaying ? 'Pause' : 'Play';
    path.setAttribute('d', isPlaying ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5v14l11-7z');
  }

  play.addEventListener('click', () => {
    if (player.paused) {
      if (activeDemoAudio && activeDemoAudio !== player) activeDemoAudio.pause();
      player.play().then(() => {
        activeDemoAudio = player;
      }).catch(() => {
        status.textContent = 'Unable to play this file.';
        seek.disabled = true;
      });
    } else {
      player.pause();
    }
  });

  player.addEventListener('play', () => {
    showPlayState(true);
    status.textContent = 'Playing sample';
    seek.disabled = false;
  });
  player.addEventListener('pause', () => {
    if (!player.ended) status.textContent = 'Paused';
    showPlayState(false);
  });
  player.addEventListener('ended', () => {
    status.textContent = 'Finished';
    showPlayState(false);
    setDemoSeekFill(seek, 100);
  });
  player.addEventListener('timeupdate', () => {
    if (player.duration) setDemoSeekFill(seek, (player.currentTime / player.duration) * 100);
  });
  seek.addEventListener('input', () => {
    if (player.duration) player.currentTime = (seek.value / 100) * player.duration;
    setDemoSeekFill(seek, seek.value);
  });

  container.append(label, play, download, nowPlaying, player);
});

/* ============================================================
   SAMPLE TEST RESTORE FORM
   The form is ready for a delivery service once the client authorises one.
   Until then, it validates locally and never claims that an uploaded file
   has been transmitted.
   ============================================================ */
const sampleRestoreButton = document.getElementById('sampleRestoreButton');
const sampleRestoreOverlay = document.getElementById('sampleRestoreOverlay');
const sampleRestoreClose = document.getElementById('sampleRestoreClose');
const sampleRestoreForm = document.getElementById('sampleRestoreForm');
const sampleRestoreStatus = document.getElementById('sampleRestoreStatus');

if (sampleRestoreButton && sampleRestoreOverlay && sampleRestoreClose && sampleRestoreForm) {
  function closeSampleRestore(){
    sampleRestoreOverlay.classList.remove('open');
    sampleRestoreOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    sampleRestoreButton.focus();
  }

  sampleRestoreButton.addEventListener('click', () => {
    sampleRestoreOverlay.classList.add('open');
    sampleRestoreOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('sampleRestoreName').focus();
  });
  sampleRestoreClose.addEventListener('click', closeSampleRestore);
  sampleRestoreOverlay.addEventListener('click', event => {
    if (event.target === sampleRestoreOverlay) closeSampleRestore();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sampleRestoreOverlay.classList.contains('open')) closeSampleRestore();
  });
  sampleRestoreForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!sampleRestoreForm.checkValidity()) {
      sampleRestoreForm.reportValidity();
      return;
    }
    sampleRestoreStatus.textContent = 'Thank you. Secure form delivery is being configured; your file has not been sent yet.';
    sampleRestoreStatus.classList.add('config-notice');
  });
}
