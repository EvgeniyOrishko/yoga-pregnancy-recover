# Yoga site — static HTML

Started as a Webflow export; now a plain HTML/CSS/vanilla-JS site with no
framework and no Webflow dependency — split into editable partials and wired
to Vite for hot reload. The shipped page is fully-rendered HTML, so every word
is in the source a crawler fetches.

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
There is no server-side runtime and no backend: the forms only run browser
validation (see `src/js/widgets/forms.js`) — point `<form action>` at a real
endpoint before you rely on them.

## Layout

```
index.html                    page shell: <head>, SEO tags, script order, includes
src/
  partials/
    header.html               nav + logo + burger
    footer.html                sticky footer
    modal.html                 contact modal (see "Known gaps" below)
    sections/                  one file per <section>, in page order
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
    base.css                  extracted/renamed layout CSS - see its own note below
    custom.css                 your overrides + all the widget CSS (reveal, modal,
                                sliders, tabs, lightbox, nav) go here
  js/
    main.js                    wires up every widget below
    widgets/
      reveal.js                fade-in-on-scroll (IntersectionObserver)
      nav.js                   mobile burger menu
      modal.js                 contact modal + per-instructor bio modals
      heroSlider.js             hero background autoplay crossfade
      journeySlider.js          journey section manual carousel
      tabs.js                   weekday tabs (timetable section)
      reviewLightbox.js         review-video popup (parses embedded Vimeo JSON)
      bgVideoControl.js         play/pause button on the one manually-controlled video
      forms.js                  submit handling (validation + done/fail state)
public/                       copied to dist/ verbatim, served from /
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

## History

This started as a Webflow export (saved from a Google-Translated tab, which
added its own mess on top — see the first history entry). It has since been
fully de-Webflow-ed: no Webflow-hosted assets, no `webflow.js`/jQuery runtime,
no `w-*` framework classes, no `data-wf-*` attributes. Every interactive
behavior that Webflow's runtime used to provide (scroll-reveal, the burger
menu, both sliders, the weekday tabs, the review lightbox, the video
play/pause button, form submit handling) is now the plain JS in
`src/js/widgets/`.

**Reference point:** the git tag `webflow-reference` is the last commit before
this rewrite — still Webflow-dependent (`webflow.js` + jQuery vendored,
`data-wf-*` on `<html>`, `w-*` classes throughout), but otherwise identical
(same partials/HMR setup, same localized assets). `git diff webflow-reference`
shows the entire rewrite as one diff; `git checkout webflow-reference` gets
you back to that state if anything here needs unwinding.

1. **Split & localize** (original Webflow-runtime version, tagged
   `webflow-reference`):
   - Stripped 1042 `<font dir="auto">` wrappers, the `#goog-gt-tt` panel and
     the translate stylesheet — artifacts of saving a Google-Translated page.
   - Removed the Webflow badge and the runtime-injected `w-mod-js w-mod-ix
     translated-ltr` classes on `<html>`.
   - Downloaded every image, background video (mp4/webm + poster frame), and
     the two webfonts into `public/images|videos|fonts`, and rewrote every
     reference to them.
   - Split the single 240 KB file into the partials above and wired up Vite.
2. **Full Webflow removal** (this state):
   - `src/styles/base.css` replaces the vendored `webflow.css`: every rule
     webflow.css defined for a class this project actually uses, kept and
     renamed (`.w-slider` → `.wg-slider`, etc.), with everything else (grid
     columns, the nav-dropdown/checkbox/radio/file-upload widgets, the
     Webflow icon font, ~140 unused classes total) cut. See the comment at
     the top of the file for exactly what that extraction covered.
   - `webflow.js` and jQuery are gone; every behavior they drove is now the
     plain JS in `src/js/widgets/` (see the file list above).
   - `data-wf-*` attributes removed (`<html>`, forms' `data-wf-page-id` /
     `data-wf-element-id` — the latter is worth calling out: those carried
     the *real* Webflow site/page IDs, so a submitted form would have quietly
     POSTed to the original template author's Webflow account, not yours).
   - The literal word "Webflow" is gone from everything served: the page
     title, the footer's platform-credit line, and a dead link to
     `yoga-db.webflow.io/404`. Verify after a build with
     `grep -ri webflow dist/`.

`_original/index.original.html` is the very first untouched download, if you
ever need to compare against the true original.

## Known gaps / simplifications

Ported everything that was reachable and visibly used. A few things were
deliberately simplified rather than byte-for-byte reproduced:

- **The contact modal (`modal.html`) has no button wired to open it** — that
  was already true in the original download (I checked empirically: none of
  the header/hero/plans CTAs opened it). It's fully functional
  (`src/js/widgets/modal.js` handles any `.modal`) if you add a trigger.
- **One decorative parallax image** (`.experts-image`, a `translate3d(0,
  -10%, 0)` inline style) used to shift slightly as you scrolled past it via
  a Webflow scroll-linked interaction. It's left as a static -10% offset now
  rather than reimplemented as a scroll listener.
- **The burger menu is one button, not two.** The original had a second,
  fully transparent `.burger-close` button stacked on top for hit-testing;
  it carried no visible content of its own, so it's gone and `.burger` alone
  now toggles open/closed (see `src/js/widgets/nav.js`).
- Code comments in `src/js/widgets/` and this README mention "Webflow" as
  historical context (why a piece of JSON is shaped the way it is, etc.) —
  that's developer documentation, not shipped output; none of it reaches
  `dist/`.

## Notes

- `src/styles/base.css` is prettier-ignored (it's a generated extraction, see
  its own header comment) and not meant to be hand-edited — put your changes
  in `custom.css` instead.
- The build minifies CSS and JS but leaves `dist/index.html` readable, so you can
  open it and see exactly what a crawler gets. Indentation costs ~5 kB gzipped;
  add `vite-plugin-html` if you want it minified too.
- `data-w-id` attributes are still on many elements. They don't do anything by
  themselves anymore (nothing reads them) — they're just inert leftover
  identifiers from the export, harmless to keep or remove.
