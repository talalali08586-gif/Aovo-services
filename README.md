# AOVO Services — Website

Marketing site for AOVO Services, LLC (international voiceover and audio
services). Plain HTML, CSS, and JavaScript — no framework, no build step,
no npm packages. See `CLAUDE.md` for the full project brief and working
agreements.

## Running it

Open `index.html` directly in a browser (double-click it, or drag it into
a browser window). No local server, no build step, no install required.

## Folder structure

```
aovo-website/
├── index.html            Home page
├── assets/
│   ├── css/style.css      All page styles
│   ├── js/main.js         Page logic — renders labels, drives the popup
│   └── img/hero.jpg      Hero photo
├── audio/                 Optimised MP3s only (never WAVs)
├── data/demos.js          Audio manifest — single source of truth
└── .gitignore
```

Raw WAVs, the original concept image, and contract documents live in
`../_client/`, outside this repo, and are never committed (`.gitignore`
excludes `_client/` and `*.wav`).

## How the manifest drives the page

`data/demos.js` defines a `DEMOS` array — one entry per service:

```js
const DEMOS = [
  { slug: 'documentaries', label: 'Documentaries',
    en: 'audio/documentaries-en.mp3', ar: 'audio/documentaries-ar.mp3' },
  // a service with no Arabic recording yet just omits "ar":
  { slug: 'old-man', label: 'Old Man Voice', en: 'audio/old-man-en.mp3' },
];
```

`assets/js/main.js` reads this array on page load and:

- Renders the 12 clickable service labels (first half of the array in the
  left column, the rest in the right column — nothing is hardcoded in
  `index.html`).
- Fills in the popup title, and the Play/Download buttons, for whichever
  service was clicked.
- **Hides** a language's card in the popup entirely if that language has
  no audio file — no broken buttons, no error messages.

**Why a `.js` file and not `.json`?** A `data/demos.json` manifest would
need to be loaded with `fetch()`, and Chrome/Edge refuse `fetch()` of
local files opened via `file://` (no CORS support without a server) —
that breaks "open `index.html` directly, no server required." Loading
the manifest as `<script src="data/demos.js">` works in every browser
with zero setup.

## How to add or update an audio category

1. **Get the source WAV** from the client (or record it) and convert it
   to a 128kbps MP3 with ffmpeg:

   ```bash
   ffmpeg -i "source.wav" -codec:a libmp3lame -b:a 128k audio/{slug}-en.mp3
   ```

   Use `-en` or `-ar` depending on the language. `{slug}` is a lowercase,
   hyphenated id for the service (e.g. `commercial-ads`) — no spaces,
   ever (spaces become `%20` in URLs and break on some hosts).

2. **Drop the MP3 into `audio/`.**

3. **Add or edit an entry in `data/demos.js`:**

   ```js
   { slug: 'commercial-ads', label: 'Commercial Ads',
     en: 'audio/commercial-ads-en.mp3', ar: 'audio/commercial-ads-ar.mp3' },
   ```

   - New category → add a new object to the array. It appears as a new
     clickable label automatically, no HTML edits.
   - Only have one language so far → just omit the other key (`en` or
     `ar`). The popup will show only the language that exists.
   - Removing a category → delete its object from the array (and, if you
     like, its MP3s from `audio/`).

That's it — no other file needs to change.

## Browser support

Tested on Chrome, Firefox, Safari, Edge, and mobile (iOS/Android). Uses
`prefers-reduced-motion` to disable animation for users who request it,
and degrades gracefully (labels still work, just without entrance
animation) on older browsers that don't support `clamp()`/`backdrop-filter`.

## Deployment

Hosted on Hostinger; audio is served through Cloudflare CDN. Since there's
no build step, deployment is just uploading the repo contents (minus
`.git`) to the host.
