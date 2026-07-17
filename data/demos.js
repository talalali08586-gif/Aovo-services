/* ============================================================
   AOVO SERVICES — demo audio manifest
   Single source of truth for every service label and its audio.
   The 12 clickable labels on the homepage, and everything shown
   in the popup, are generated from this array — nothing about
   services or audio paths is hardcoded in index.html or main.js.

   HOW TO ADD OR UPDATE A CATEGORY — full guide in README.md.
   Quick version:
     1. Convert the WAV to a 128kbps MP3:
          ffmpeg -i "source.wav" -codec:a libmp3lame -b:a 128k audio/{slug}-en.mp3
     2. Save it into audio/ as  {slug}-en.mp3  and/or  {slug}-ar.mp3
     3. Add (or edit) an entry below. Omit "ar" (or "en") entirely if
        that language hasn't been recorded yet — the popup hides that
        language option automatically, no code changes needed.

   Note: this is a plain .js file, not .json. A .json manifest would
   need to be loaded with fetch(), which Chrome and Edge block for
   local files opened via file:// (no CORS support without a server).
   Loading it as a <script src="data/demos.js"> keeps "open index.html
   directly, no server required" working in every browser.
   ============================================================ */
const DEMOS = [
  { slug: 'documentaries',     label: 'Documentaries',                  en: 'audio/documentaries-en.mp3',     ar: 'audio/documentaries-ar.mp3' },
  { slug: 'commercial-ads',    label: 'Commercial Ads',                 en: 'audio/commercial-ads-en.mp3',    ar: 'audio/commercial-ads-ar.mp3' },
  { slug: 'marching-band',     label: 'Marching Band Shows',            en: 'audio/marching-band-en.mp3' },
  { slug: 'e-learning',        label: 'E-Learning',                     en: 'audio/e-learning-en.mp3',        ar: 'audio/e-learning-ar.mp3' },
  { slug: 'ivr-telephony',     label: 'IVR & Telephony',                en: 'audio/ivr-telephony-en.mp3',     ar: 'audio/ivr-telephony-ar.mp3' },
  { slug: 'intl-voices',       label: 'International Voices & Accents', en: 'audio/intl-voices-en.mp3' },
  { slug: 'stories-narration', label: 'Stories & Narration',            en: 'audio/stories-narration-en.mp3', ar: 'audio/stories-narration-ar.mp3' },
  { slug: 'faith-based',       label: 'Faith-Based Content',            en: 'audio/faith-based-en.mp3',       ar: 'audio/faith-based-ar.mp3' },
  { slug: 'video-games',       label: 'Video Games',                    en: 'audio/video-games-en.mp3',       ar: 'audio/video-games-ar.mp3' },
  { slug: 'social-reels',      label: 'Social Reels',                   en: 'audio/social-reels-en.mp3',      ar: 'audio/social-reels-ar.mp3' },
  { slug: 'youtube',           label: 'YouTube Channels',               en: 'audio/youtube-en.mp3',           ar: 'audio/youtube-ar.mp3' },
  { slug: 'old-man',           label: 'Old Man Voice',                  en: 'audio/old-man-en.mp3' },
];
