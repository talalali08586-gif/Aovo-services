/* ============================================================
   AOVO SERVICES — shared audio player building blocks

   The Home page popup (main.js) and the Audio Services page cards
   (audio-services.js) show the same gold Play/Pause button and gold
   seek bar, but arrange them differently: the popup has one <audio>
   shared by the English and Arabic cards, while the Audio Services
   page gives every service card its own <audio>.

   The small pieces they genuinely have in common live here, so the
   icon shapes and the seek-bar colour are defined once. Load this
   file BEFORE main.js or audio-services.js on any page that uses
   either of them.
   ============================================================ */

/* The two states of the play button, as SVG path data. */
const AUDIO_ICON_PLAY  = 'M8 5v14l11-7z';
const AUDIO_ICON_PAUSE = 'M7 5h4v14H7zM13 5h4v14h-4z';

/* Colour of the not-yet-played portion of a seek bar. Matches the
   faded gold used elsewhere in style.css. */
const SEEK_TRACK_COLOUR = 'rgba(216,178,90,.18)';

/* Builds the small play triangle used inside a Play button. Created in
   script rather than written into the HTML because the Audio Services
   cards build their controls from the manifest. */
function makePlayIcon(){
  const svg  = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.setAttribute('viewBox', '0 0 24 24');
  path.setAttribute('d', AUDIO_ICON_PLAY);
  svg.appendChild(path);
  return svg;
}

/* Paints a range input so everything left of the handle is solid gold
   and everything right of it is faded — the browser has no standard way
   to style a range track, so we use a hard-stop gradient instead. */
function setSeekFill(seekEl, percent){
  seekEl.value = percent;
  seekEl.style.background =
    `linear-gradient(90deg,var(--gold) ${percent}%,${SEEK_TRACK_COLOUR} ${percent}%)`;
}

/* Swaps a Play button between its play and pause appearance.

   updateLabel is opt-in: the Audio Services cards swap their visible
   text between "Play" and "Pause", while the popup's language buttons
   deliberately keep their "Play" wording and change only the icon.
   Passing it explicitly keeps each page looking exactly as approved. */
function setPlayButtonState(btn, isPlaying, updateLabel){
  btn.classList.toggle('playing', isPlaying);
  btn.querySelector('path').setAttribute('d', isPlaying ? AUDIO_ICON_PAUSE : AUDIO_ICON_PLAY);
  if (updateLabel && btn.lastChild && btn.lastChild.nodeType === Node.TEXT_NODE) {
    btn.lastChild.nodeValue = isPlaying ? 'Pause' : 'Play';
  }
}
