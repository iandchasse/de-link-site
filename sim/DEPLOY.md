# CrossPoint Web Reader — deployment handoff

This bundle is a **self-contained static build** of the CrossPoint e-reader
firmware compiled to WebAssembly (the real firmware, running an SDL2 canvas in
the browser). It is a drop-in folder — **no build step, no server-side tooling,
no rebuild required to deploy or to change content.**

Target site: **de-link-site** (https://de-link.me). Everything here is designed
to live at an arbitrary subpath (default: `/crosspoint/`) without disturbing the
rest of the site.

---

## TL;DR — 3 steps

1. **Copy the `crosspoint/` folder into the root of the de-link-site repo.**
   It will be served at `https://de-link.me/crosspoint/`. (You may rename the
   folder to any subpath — see "Renaming the folder" below.)

2. **Give it cross-origin isolation.** The WASM build is multithreaded and needs
   `SharedArrayBuffer`, which requires COOP/COEP headers. You have two options
   (either one is sufficient — pick ONE):
   - **A. Cloudflare Pages `_headers` (recommended, cleanest).** Add the block
     shown in "Option A" below to the site's **root** `_headers` file, scoped to
     `/crosspoint/*`. (Create a root `_headers` if the site doesn't have one.)
   - **B. Do nothing.** The bundled `coi-serviceworker.js` injects the headers
     client-side and works on *any* static host (Cloudflare Pages, GitHub Pages,
     Netlify, S3, …) with zero configuration. Cost: one silent page reload on a
     visitor's very first load while the worker installs. **This path is tested
     and verified working on a header-less subpath.**

3. **Link to it** from the site (optional) — e.g. add a button in `topbar.js`
   pointing at `/crosspoint/`. The reader is its own full page; you don't need to
   embed it.

That's it. Open `https://de-link.me/crosspoint/` and the reader boots to a Home
screen with three sample books.

---

## Option A — Cloudflare Pages root `_headers` (recommended)

> ⚠️ **Cloudflare Pages reads only ONE `_headers` file, and it must be at the
> deployed site root.** A `_headers` placed inside `crosspoint/` is **ignored**.
> So for a subpath deploy, put these rules in the site's *root* `_headers`.

Add (or merge) this into the de-link-site **root** `_headers`:

```
/crosspoint/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp

/crosspoint/fs/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cache-Control: public, max-age=31536000, immutable
```

- Scope it to `/crosspoint/*` **only** — do NOT apply COOP/COEP site-wide
  (`/*`), or you may break other pages that embed third-party/cross-origin
  resources (the 3D viewer, Patreon/Kit/Discord widgets, etc.).
- The `crosspoint/_headers` file included in this bundle is a **reference copy**
  of these rules (scoped to `/*`); it is not read by Cloudflare from a subfolder.
  Use it as the source to copy from, or delete it after deploying.
- If you use Option A, the `coi-serviceworker.js` fallback stays dormant (the
  page sees it's already isolated and never registers the worker).

---

## Renaming the folder / choosing a different subpath

Every asset the page loads is referenced by a **relative** path, so the bundle is
fully portable: rename `crosspoint/` to whatever you like (e.g. `reader/`,
`ereader/`, `demo/crosspoint/`) and it just works. The **only** thing that must
match the folder name is the scope in the root `_headers` (Option A) — change
`/crosspoint/*` and `/crosspoint/fs/*` to match your chosen path. Option B (the
service worker) needs no changes at all; its scope follows the folder
automatically.

---

## Do NOT

- **Don't embed the reader inside an existing content page** that loads
  cross-origin resources. COEP `require-corp` will block any subresource that
  lacks CORP/CORS. The reader ships as its own standalone page (`index.html`);
  link to it, or embed it in an `<iframe>` with
  `allow="cross-origin-isolated"` on a page that is itself isolated.
- **Don't move/rename individual files inside the folder.** They are co-located
  and referenced relatively; keep `index.html`, the `*.js`/`*.wasm`,
  `manifest.json`, `models.json`, `seed.json`, `coi-serviceworker.js`, and `fs/`
  together. (Renaming the *folder* is fine.)
- **Don't set COOP/COEP on `/*`** (see Option A).

---

## What's inside (108 files, ~155 MB)

| Path | What it is |
| --- | --- |
| `index.html` | The loader/UI page (model dropdown, integer portrait scaling, first-visit seeding, wake overlay, COI service-worker registration). |
| `coi-serviceworker.js` | COOP/COEP fallback for hosts that can't set headers (Option B). |
| `_headers` | **Reference only** — Cloudflare rules to copy into the site root (Option A). |
| `x4.js` / `x4.wasm` | XTEINK X4 build (default, keyboard). |
| `x4pro.js` / `x4pro.wasm` | XTEINK X4 Pro build (touch: mouse = tap/drag). |
| `x3.js` / `x3.wasm` | XTEINK X3 build (528×792, keyboard). |
| `models.json` | Model registry the dropdown reads. |
| `manifest.json` | List of loose `fs/` files the loader streams into the in-browser filesystem at boot. |
| `seed.json` | First-visit default state (theme, recents, settings) applied when storage is empty. |
| `fs/fonts/` | 21 font families (84 `.cpfont` files, ~63 MB). |
| `fs/books/` | Sample EPUBs (~25 MB; Pride & Prejudice is the large one). |
| `fs/dictionaries/` | StarDict `wikt-en-en` dictionary (~46 MB). |
| `fs/Welcome.txt` | Sample text file. |

**Asset-size note:** every single file is **< 25 MiB**, so Cloudflare Pages'
per-asset limit is satisfied (largest = the dictionary `.dict.dz` at 24.85 MiB,
then the 23.7 MiB EPUB, then the 5.2 MiB `.wasm` files). This is why the
filesystem is shipped as loose files rather than one big packed blob.

### Reducing weight (optional)

The full bundle is ~155 MB on disk. No single file trips a host limit, but if
you want a smaller commit into the repo you can trim without a rebuild:

- **Ship one model instead of three:** delete the two unwanted `x*.js` + `x*.wasm`
  pairs and remove their entries from `models.json` (saves ~5.5 MB each). The
  dropdown only lists models whose `.js` is present.
- **Trim fonts:** delete unwanted family folders under `fs/fonts/` and their
  entries in `manifest.json` (fonts are ~63 MB total).
- **Drop the dictionary:** delete `fs/dictionaries/` and its `manifest.json`
  entries (~46 MB) if you don't need in-reader lookups.

Leave `index.html`, `coi-serviceworker.js`, `seed.json`, and at least one model
in place. If you trim fonts/books referenced by `seed.json`'s default state,
that's fine — missing recents just won't render a cover.

---

## Models

Three device profiles ship. Switch with the on-page dropdown, or directly via a
query string:

- `…/crosspoint/` or `?model=x4` → XTEINK X4 (default, keyboard only)
- `?model=x4pro` → XTEINK X4 Pro (touch enabled; click = tap, drag = swipe)
- `?model=x3` → XTEINK X3 (3.7″ 528×792 panel)

Keyboard: arrows = navigate, Enter = select, Esc = back, `s` = sleep, `p` = power
(wake), `h` = Home key.

---

## Default state (seeding) & returning visitors

On a visitor's **first** load (empty browser storage) the reader seeds a curated
default: Lyra Extended theme, three books in Recents with covers, and preset
font / dictionary / sleep settings, landing on the Home screen. This is applied
by `index.html` from `seed.json` and only runs when the per-visitor storage
(IndexedDB) is empty.

Returning visitors keep **their own** state (books opened, settings changed,
reading positions) — the default is not re-applied. To preview the shipped
default again yourself, clear site data for `de-link.me` in DevTools →
Application → Storage.

---

## Updating content later (no rebuild)

Because the filesystem is loose static files, you can change content by editing
files and the manifest — **no toolchain, no recompile**:

1. Add/replace a file under `crosspoint/fs/…` (e.g. a new book in
   `fs/books/`, a font family folder in `fs/fonts/`, or a dictionary in
   `fs/dictionaries/<name>/`).
2. Edit `crosspoint/manifest.json` to match: each entry is
   `{ "path": "/fs_/<rel>", "url": "fs/<rel>", "size": <bytes>, "defer": <bool> }`.
   Set `"defer": true` for large dictionaries (they stream in after boot);
   fonts/books use `"defer": false`.
3. Keep every file **under 25 MiB** for Cloudflare Pages. A larger file would
   need to be split (the loader also supports a `"parts": [url, …]` entry that it
   concatenates) or hosted on R2.

Dictionary layout the firmware expects: one folder per dictionary under
`fs/dictionaries/`, containing a matching `.ifo` + `.idx` + `.dict` (or
`.dict.dz`) StarDict set with 32-bit offsets.

---

## Verify after deploying

1. Open `https://de-link.me/crosspoint/`.
2. DevTools → Console: `crossOriginIsolated` should be `true`
   (with Option B it flips true after the automatic first-load reload).
3. The reader should boot to a **Home screen with three book covers**
   (Pride and Prejudice, The Odyssey, Romeo and Juliet).

If the screen is blank:
- Confirm cross-origin isolation: Network tab → the `index.html` document
  response should carry COOP/COEP (Option A), **or** Application → Service
  Workers should show `coi-serviceworker.js` activated (Option B).
- Confirm the `fs/…` requests return **200**, not 404 (a wrong subpath or a
  moved file breaks the filesystem load).
- Hard-reload once (Option B installs the worker on the first visit and reloads).

---

*Generated as a deploy handoff. The bundle contains no secrets and no
server-side code — it is 100% static assets.*
