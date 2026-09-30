// Every interactive behaviour on the page lives here (or in ./widgets/) -
// there is no framework runtime and no vendor script loaded before this.
import { initLoader } from "./widgets/loader.js";
import { initTheme } from "./widgets/theme.js";
import { initReveal } from "./widgets/reveal.js";
import { initNav } from "./widgets/nav.js";
import { initExpand } from "./widgets/expand.js";
import { initCarousels } from "./widgets/carousel.js";
import { initMarquee } from "./widgets/marquee.js";
import { initAccordion } from "./widgets/accordion.js";
import { initForms } from "./widgets/forms.js";

initLoader();
initTheme();
initReveal();
initNav();
initExpand();
initCarousels();
initMarquee();
initAccordion();
initForms();

if (import.meta.hot) {
  import.meta.hot.accept();
}
