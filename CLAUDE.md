# AOVO Services — Project Context

## What this is

A marketing website for **AOVO Services, LLC** — an international voiceover and audio
services business. Built and maintained by **Syed Talal Ali** (contractor) for
**Trena & Ahmed** (client). The client owns this repository and the full source code.

Note: the client has access to this repo. Keep all commits, comments, and notes professional.

---

## Stack — decided, do not revisit

**Plain HTML, CSS, and JavaScript. No framework. No build step. No bundler.**

This was a deliberate decision, not an oversight:

- WordPress and Elementor were evaluated and **rejected**. The interactive hero
  (clickable labels → bilingual popup → play/download) does not translate cleanly
  into a page builder.
- Hostinger's default site builder was also rejected for the same reason.
- The contract specifies: *no unnecessary third-party dependencies, keeping the
  codebase light and readable.* Honour this. Do not add npm packages, jQuery,
  React, Tailwind, or a bundler. If a dependency seems necessary, ask first.

Hosting is Hostinger. Audio is served through Cloudflare CDN. The site must run by
opening `index.html` directly in a browser — no local server required.

---

## The design is approved — do not change it

The client reviewed and signed off on the Home page. Treat the current visual design
as **locked**. Refactoring is welcome; redesigning is not. If a change would alter
what the client sees, ask before doing it.

Design characteristics to preserve:

- Gold-on-charcoal luxury theme
- Fonts: **Cinzel** (headings) + **Outfit** (body), loaded from Google Fonts
- Title: "AOVO" in heavy Cinzel, "Services" in gold italic
- Subtitle pill: gold border, mic icon, "International Voiceover and Audio Services"
- Hint text: "Click on any label to hear sample demos"
- Client's studio photo as centred hero
- **12 clickable service labels** flanking the photo (6 left, 6 right), each with a
  gold triangle cursor icon on the right side
- **L-shaped elbow connector lines** from labels toward centre — not diagonal lines
- Bottom bar: dark rounded rectangle, gold border, 4 feature badges with vertical dividers
- Fully mobile responsive (the client's concept was desktop-only; the mobile layout
  is original work — labels collapse to a 2-column grid, single column under 420px)

Services include: Documentaries, Commercial Ads, Marching Band Shows, E-Learning,
IVR & Telephony, International Voices & Accents, and others.

---

## Repository structure

```
aovo-website/
├── index.html            Home page
├── about.html            About Us          (Phase 2)
├── reviews.html          Reviews & Clients (Phase 3)
├── contact.html          Contact / Quote   (Phase 4)
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── img/hero-2.jpg   (versioned — always rename when replacing, see README)
├── audio/                Optimised MP3s only
├── data/demos.js         Audio manifest — single source of truth
├── README.md
└── .gitignore
```

Raw WAVs, the concept image, and contract documents live in `../_client/`,
**outside this repo**. Never commit them. `.gitignore` excludes `*.wav`.

---

## Audio rules

**Naming:** `{service-slug}-{en|ar}.mp3` — lowercase, hyphens, no spaces, ever.
Example: `documentaries-en.mp3`. Spaces become `%20` in URLs and break on some hosts.

**Format:** MP3, 128kbps, converted from client WAVs via ffmpeg. Never commit WAVs.

**Playback:** native HTML5 audio, `preload="none"` — nothing loads until the visitor
clicks Play. Each sample needs Play/Pause, a live progress bar, and a Download button,
in both English and Arabic.

**The manifest (`data/demos.js`) drives everything.** The contract promises that new
categories can be added *simply by updating the manifest file and uploading the audio*.
Nothing about services or audio paths may be hardcoded in HTML or JS.

It's a plain `.js` file (not `.json`), loaded via `<script src="data/demos.js">` and
assigned to a `const DEMOS = [...]`. A `.json` manifest would need `fetch()`, which
Chrome and Edge refuse for local files opened via `file://` (no CORS support without
a server) — that would break "open `index.html` directly, no server required." Loading
it as a script tag works in every browser with no server.

```js
const DEMOS = [
  {
    slug: "documentaries",
    label: "Documentaries",
    en: "audio/documentaries-en.mp3",
    ar: "audio/documentaries-ar.mp3"
  }
];
```

Arabic content must render with correct RTL layout.

---

## Contractual deliverables — these are not optional

From the signed SOW:

- Code organised into clearly labelled, commented sections
- Plain-English comments throughout, so any developer can pick this up later
- Regular commits with clear, descriptive messages
- `README.md` containing setup notes **and a short guide on how to add or update
  audio files**
- Each phase published to a private staging link for client review before going live
- Tested on Chrome, Firefox, Safari, Edge, plus iOS and Android

---

## Phases

| Phase | Focus | Status |
|---|---|---|
| 1 | Home page, GitHub repo, staging link | **In progress** |
| 2 | About Us | Blocked — awaiting client bio, photos, brand story |
| 3 | Reviews & Clients, Services | Blocked — awaiting testimonials, logos, copy |
| 4 | Contact / Quote form → AOVO email, spam protection | Not started |
| 5 | MP3 optimisation, Cloudflare CDN, cross-browser testing, production deploy, handover | Not started |

Phases 2–4 begin within 3 business days of receiving the required content. The client
may send page content in **any order** — each page is built independently.

---

## Working agreements

- Commit after each working change, with a clear message.
- Ask before adding any dependency.
- Ask before changing anything the client has already approved visually.
- Prefer editing existing files over creating new ones.
- Keep the codebase readable by a stranger — that is a contractual requirement,
  not a preference.
