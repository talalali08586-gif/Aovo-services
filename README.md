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
├── about.html            About Us page
├── feedback.html         Client reviews (testimonial slider)
├── audio-services.html   Audio Services page (cleanup / restoration)
├── contact.html          Contact & order form
├── assets/
│   ├── css/style.css     All page styles (every page shares this one file)
│   ├── js/main.js        Shared — header menu, home labels, demo popup
│   ├── js/audio-services.js  Audio Services page players + restore form
│   ├── img/hero-2.jpg    Hero photo, desktop (versioned — see note below)
│   ├── img/hero-2-mobile.jpg  Portrait crop served to phones/tablets
│   ├── img/logo-white.png     Logo used in the header and hero
│   └── img/about-*.jpg   About page photos (founders + talent network)
├── audio/                Optimised MP3s only (never WAVs)
├── data/demos.js         Home page audio manifest — single source of truth
├── data/audio-services-demos.js  Audio Services page sample manifest
├── README.md
├── CLAUDE.md             Project brief and working agreements
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

## How to add an Audio Services page sample

The technical service cards use their own manifest,
`data/audio-services-demos.js`, so adding a sample never changes the
approved set of 12 Home-page labels.

1. Convert the approved WAV to a 128kbps MP3 and save it in `audio/` with
   a lowercase, hyphenated name ending in `-en.mp3` (or `-ar.mp3` when an
   Arabic version is supplied).
2. Add that path and the card's slug to `AUDIO_SERVICE_DEMOS` in
   `data/audio-services-demos.js`.
3. Add the same slug as `data-audio-service-demo` on the matching card in
   `audio-services.html` if it is not already there.

Cards without a listed sample simply show no player until the client supplies
one. The current files are English-only.

## Form delivery (Contact and Sample Test Restore)

Both forms send through the AOVO mailbox `info@aovoservices.com` on
Hostinger, using the small PHP scripts in `api/`:

| File | Job |
|---|---|
| `api/contact.php` | Emails the Contact & Order form to AOVO |
| `api/sample-restore.php` | Saves the uploaded audio and emails AOVO a download link |
| `api/download.php` | Serves that download link (the uploads folder is closed to the web) |
| `api/mailer.php` | Shared helpers: settings, field cleaning, sending over SMTP |
| `api/config.example.php` | Template for the settings file |

Uploaded audio is linked rather than attached, because email services
reject attachments over about 25MB and customers often send long
recordings. Replying to a form email in AOVO's inbox goes straight to the
visitor. Spam protection is a hidden "trap" field that only bots fill in,
plus checks on every field on the server.

**Forms only send from the live or staging site.** PHP does not run when
a page is opened straight from a folder, so a local submit shows the
"please email us directly" message instead.

### Setting it up on the server (one time)

1. On Hostinger, open the site's `api/` folder in File Manager.
2. Copy `config.example.php` to `config.php` and replace
   `PASTE-THE-MAILBOX-PASSWORD-HERE` with the mailbox password.
   `config.php` is in `.gitignore`: the password must never be committed.
3. Set `to_address` to wherever submissions should arrive, and
   `site_url` to the site's address (the staging address while testing
   on staging).
4. Submit both forms once and confirm the emails arrive, including the
   download link.

To change who receives submissions later, edit `to_address` in
`config.php`. Nothing else needs to change.

### Upload size

The largest upload is 100MB. It is set in three places that must agree:
`max_upload_mb` in `config.php`, `data-max-mb` on the file input in
`audio-services.html`, and the PHP limits in `api/.user.ini` (kept a
little higher). If Hostinger's plan caps uploads lower, lower all three.

Uploaded files stay in `api/uploads/` until someone deletes them, so
clear out old ones from File Manager now and then.

## Browser support

Tested on Chrome, Firefox, Safari, Edge, and mobile (iOS/Android). Uses
`prefers-reduced-motion` to disable animation for users who request it,
and degrades gracefully (labels still work, just without entrance
animation) on older browsers that don't support `clamp()`/`backdrop-filter`.

## How to replace the hero photo

Browsers, phones, and CDNs cache images very aggressively. If you replace
the photo but keep the same filename, visitors — especially on mobile,
where there is no "hard refresh" — will keep seeing the **old** photo,
sometimes for weeks. This is the classic cause of "we uploaded a sharp
new image but phones still show a blurry one."

So, to swap the photo:

1. Save the new image with a **new, numbered filename** — the current one
   is `hero-2.jpg`, so the next would be `hero-3.jpg`, then `hero-4.jpg`,
   and so on. Never reuse an old filename.
2. Put it in `assets/img/`.
3. **Also generate the mobile version.** Phones and tablets are served a
   pre-cropped portrait copy (`hero-2-mobile.jpg`), kept at 1600px wide
   or less because Hostinger's CDN image optimizer shrinks anything
   larger (that shrinking is what once made the hero look blurry on
   phones). For a 16:9-ish source photo, this ffmpeg command crops the
   centre and resizes it (adjust the crop x-offset `450` if the subject
   isn't centred):

   ```bash
   ffmpeg -i assets/img/hero-3.jpg -vf "crop=1788:1520:450:0,scale=1600:1360:flags=lanczos" -q:v 2 assets/img/hero-3-mobile.jpg
   ```

4. Update the `<picture>` block in `index.html`: the `<source>` `srcset`
   points at the new mobile file, the `<img>` `src` at the new desktop
   file (and update `width`/`height` to the images' real pixel sizes).
5. Upload all changed files to the host. Old image files can be deleted.

Similarly, `style.css` is linked with a `?v=` cache-buster on every page.
After changing the CSS, bump that number **in every HTML file** so cached
copies on visitors' phones are refreshed.

## Deployment

Hosted on Hostinger; audio is served through Cloudflare CDN. Since there's
no build step, deployment is just uploading the repo contents (minus
`.git`) to the host.

**After deploying, purge the caches** so visitors get the new files
immediately:

- Cloudflare dashboard → Caching → *Purge Everything* (or purge the
  specific changed URLs).
- Hostinger hPanel → Websites → your site → *Clear cache* (if the plan's
  CDN/cache feature is enabled).

Also note: **CDN image optimizers re-shrink images.** Hostinger's CDN
was confirmed (July 2026) to downscale the 2688px hero photo to 1600px
and recompress it, which made it blurry on phones. Turn off image
optimization in hPanel (Websites → your site → Performance → CDN) if the
plan allows it; either way, images meant for high-DPI phone screens are
kept at 1600px wide or less so the optimizer has nothing to shrink.
Cloudflare's **Mirage**/**Polish** features do the same — keep them off
for this site too.
