import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";

const root = dirname(fileURLToPath(import.meta.url));
const partials = resolve(root, "src/partials");

export default defineConfig({
  // Served on a custom domain (makorishko.yoga) at the domain root, not
  // under /<repo-name>/ - a custom domain always serves from /, regardless
  // of whether GitHub Pages is a project or user repo. Every asset reference
  // in this project is a root-absolute path (/images/..., /fonts/..., etc.),
  // so base has to match wherever the site is actually mounted, or every
  // image/video/font 404s. If you ever drop the custom domain and go back to
  // the default <user>.github.io/<repo-name>/ URL, set this back to
  // "/yoga-pregnancy-recover/".
  base: "/",

  plugins: [
    handlebars({
      // Every .html file under src/partials is registered as a partial, named
      // by its path without the extension: src/partials/sections/hero.html
      // becomes {{> sections/hero }}.
      partialDirectory: partials,
      // Values available inside partials and index.html as {{ site.name }} etc.
      context: {
        site: {
          name: "Yoga DB",
          url: "https://makorishko.yoga",
        },
      },
    }),
    {
      // vite-plugin-handlebars inlines partials at transform time, so Vite does
      // not know index.html depends on them. Without this, editing a section
      // file changes nothing in the browser.
      name: "reload-on-partial-change",
      handleHotUpdate({ file, server }) {
        if (file.startsWith(partials)) {
          server.ws.send({ type: "full-reload", path: "*" });
          return [];
        }
      },
    },
  ],

  server: {
    port: 3000,
    open: true,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    // CSS and JS are minified; the HTML itself is left readable on purpose so
    // you can open dist/index.html and check exactly what crawlers will see.
    // (Indentation costs ~5 kB gzipped. Add vite-plugin-html if you want it gone.)
    minify: "esbuild",
    // Never base64-inline assets into the HTML - keeps the markup legible.
    assetsInlineLimit: 0,
  },
});
