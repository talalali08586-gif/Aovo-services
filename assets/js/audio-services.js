/* ============================================================
   AOVO SERVICES — Audio Services page demo players
   Reads the separate page manifest and adds a native, on-demand player
   only to service cards with an approved sample. Audio paths remain in
   data/audio-services-demos.js, never in this page's HTML or JavaScript.
   ============================================================ */
const audioServiceDemoMap = Object.fromEntries(
  AUDIO_SERVICE_DEMOS.map(demo => [demo.slug, demo])
);

document.querySelectorAll('[data-audio-service-demo]').forEach(container => {
  const demo = audioServiceDemoMap[container.dataset.audioServiceDemo];
  if (!demo || !demo.en) return;

  const label = document.createElement('span');
  label.className = 'audio-service-demo-label';
  label.textContent = 'Sample demo';

  const player = document.createElement('audio');
  player.controls = true;
  player.preload = 'none';
  player.src = demo.en;
  player.setAttribute('aria-label', 'Play service sample');

  const download = document.createElement('a');
  download.className = 'audio-service-download';
  download.href = demo.en;
  download.download = `${demo.slug}-en.mp3`;
  download.textContent = 'Download';

  container.append(label, player, download);
});
