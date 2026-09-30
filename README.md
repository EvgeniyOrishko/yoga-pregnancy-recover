# Serena Yoga — static HTML

A single-page yoga studio site built from the "Serena" Framer template: plain
HTML/CSS/vanilla JS, no framework and no Framer runtime, split into editable
partials and wired to Vite for hot reload. The shipped page is fully-rendered
HTML, so every word is in the source a crawler fetches. The original template
export is archived in `_original/new.serena.html`.

## Requirements

Node 20.19+ (`.nvmrc` pins 22). Run `nvm use` in this directory first.

```bash
nvm use
npm install
```

## Commands

| Command                | What it does                                               |
| ---------------------- | ---------------------------------------------------------- |
| `npm run dev`          | Dev server on http://localhost:3000 with hot reload        |
| `npm run build`        | Static site into `dist/`                                   |
| `npm run preview`      | Serve `dist/` locally, to check the build before deploying |
| `npm run format`       | Prettier over `index.html`, partials, CSS, JS              |
| `npm run format:check` | Fails if anything is unformatted (use in CI)               |

Deploying is copying `dist/` to any static host — Netlify, Vercel, S3, nginx,
GitHub Pages (see `.github/workflows/deploy.yml`). There is no backend: the
newsletter form only runs browser validation (see `src/js/widgets/forms.js`) —
point `<form action>` at a real endpoint before you rely on it.

## Layout

```
index.html                 head/SEO tags + the section order
src/partials/
  header.html footer.html  fixed nav + dropdown; CTA banner + footer
  logo.html spark.html     inline SVGs (use currentColor)
  chevron.html social.html small shared pieces
  sections/                hero, philosophy, studio, classes, reviews, journal, faq
src/styles/
  fonts.css tokens.css     @font-face; colors + type scale per breakpoint
  base.css components.css  reset/reveal; buttons, type, arrows, dots
  sections.css             layout of each section
src/js/widgets/            nav, reveal, expand, carousel, marquee, accordion, forms
public/images, public/fonts  self-hosted assets (served from /)
```

Breakpoints (from the template): desktop ≥ 1200px, tablet 810–1199px,
mobile ≤ 809px. Every size that changes between them is a variable in
`src/styles/tokens.css`.

Every `.html` under `src/partials` is registered as a Handlebars partial named
by its path: `src/partials/sections/hero.html` is `{{> sections/hero }}`.
Site-wide values (`{{ site.url }}`) come from `vite.config.js`.

## What the scripts do

- **nav** — the header is transparent over the hero and becomes a frosted pill
  after scrolling (`.is-scrolled`); below 1200px the burger toggles the dropdown.
- **expand** — the studio card starts inset with rounded corners and grows to
  full bleed as it scrolls into view (`--expand`, 0 to 1).
- **carousel** — the studio slideshow (`data-carousel="slides"`: dots, arrows,
  swipe) and the class cards (`data-carousel="scroll"`: scroll-snap row that the
  arrows and mouse-drag move).
- **marquee** — the reviews row loops forever; hover pauses it.
- **accordion** — the FAQ, with `aria-expanded` on each button.
- **reveal** — fade/slide sections in on first view (`.reveal`).

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds on every push to `master` and publishes
`dist/`. `vite.config.js` sets `base: "/"` for the custom domain
(`postpartum.makorishko.yoga`); every asset path in the project is
root-absolute, so if you go back to `<user>.github.io/<repo-name>/`, set `base`
to that path.
