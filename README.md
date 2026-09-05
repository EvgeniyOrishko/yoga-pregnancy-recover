# Yoga site — static HTML

A Webflow export, split into editable partials and wired to Vite for hot reload.
No framework: the shipped page is plain, fully-rendered HTML, so every word is in
the source a crawler fetches.

## Requirements

Node 20.19+ (`.nvmrc` pins 22). Your shell's default `node` is 16, which Vite
will reject — run `nvm use` in this directory first.

```bash
nvm use
npm install
```

## Commands

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Dev server on http://localhost:3000 with hot reload        |
| `npm run build`        | Static site into `dist/`                                   |
| `npm run preview`      | Serve `dist/` locally, to check the build before deploying |
| `npm run format`       | Prettier over `index.html`, partials, CSS, JS              |
| `npm run format:check` | Fails if anything is unformatted (use in CI)               |

Deploying is copying `dist/` to any static host — Netlify, Vercel, S3, nginx.
There is no server-side runtime.

## Layout

```
index.html                    page shell: <head>, SEO tags, script order, includes
src/
  partials/
    header.html               nav + logo + burger
    footer.html               sticky footer
    modal.html                booking modal
    head/
      ix2-initial-state.html  Webflow-generated pre-animation CSS (do not hand-edit)
    sections/                 one file per <section>, in page order
      hero.html
      sessions.html
      experts.html
      instructors.html
      reviews.html
      journey.html
      plans.html
      timetable.html
      contact.html
  styles/
    main.css                  entry; imports the two below in order
    webflow.css               vendored Webflow export — leave untouched
    custom.css                your overrides go here
  js/
    main.js                   your scripts (jQuery + Webflow already loaded)
public/                       copied to dist/ verbatim, served from /
  vendor/                     jquery + webflow.js, loaded as plain scripts
  images/                     every <img>/srcset/background-image asset
  videos/                     background-video mp4/webm + poster frames
  fonts/                      Playfair Display + Poppins, self-hosted woff2
_original/                    the untouched downloaded page, for diffing
```

### How the includes work

`vite-plugin-handlebars` registers every `.html` under `src/partials/` as a
partial named by its path:

```html
{{> header }}
{{> sections/hero }}
```

Shared values live in `context` in `vite.config.js` and are read as
`{{ site.url }}`. To add a section: drop a file in `src/partials/sections/` and
add one `{{> sections/name }}` line to `index.html`.

The `{{> … }}` lines carry `<!-- prettier-ignore -->` markers. Prettier otherwise
reflows them across lines, which works but is unreadable — leave the markers in.

### Hot reload

- **CSS** — `src/styles/custom.css` hot-swaps with no page reload.
- **Partials / index.html** — the browser reloads. Partials are inlined at
  transform time, so Vite can't see the dependency on its own; the
  `reload-on-partial-change` plugin in `vite.config.js` is what makes this work.
  Delete it and section edits will silently do nothing.

## What was changed from the download

- Stripped 1042 `<font dir="auto">` wrappers, the `#goog-gt-tt` panel and the
  translate stylesheet — all artifacts of saving a Google-Translated page.
- Removed the Webflow badge and the runtime-injected `w-mod-js w-mod-ix
  translated-ltr` classes on `<html>` (webflow.js re-adds them on load).
- Vendored the CSS, jQuery and webflow.js locally instead of loading them from
  Webflow's CDN, and moved the base64 favicon out to `public/favicon.jpg`.
- Downloaded every image, background video (mp4/webm + poster frame), and the
  two webfonts (Playfair Display, Poppins) that the export pulled from
  `assets-global.website-files.com` / `cdn.prod.website-files.com` /
  `assets.website-files.com`, into `public/images|videos|fonts`, and rewrote
  every `src`, `srcset`, `data-poster-url`, `data-video-urls`, and CSS `url()`
  that pointed at them. Nothing in `dist/` calls out to Webflow anymore — check
  with `grep -r website-files.com dist/` after a build.
- Reformatted the markup with Prettier (`htmlWhitespaceSensitivity: "css"`).

`_original/index.original.html` is the untouched download if you need to compare.

## Notes

- `src/styles/webflow.css` and `public/vendor/` are prettier-ignored on purpose,
  so a future Webflow re-export can drop straight over them.
- The build minifies CSS and JS but leaves `dist/index.html` readable, so you can
  open it and see exactly what a crawler gets. Indentation costs ~5 kB gzipped;
  add `vite-plugin-html` if you want it minified too.
- `ix2-initial-state.html` and the `data-w-id` attributes drive Webflow's
  interactions. Removing a `data-w-id` disables that element's animation.
