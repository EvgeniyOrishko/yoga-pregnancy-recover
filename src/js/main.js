// Every interactive behaviour on the page lives here (or in ./widgets/) -
// there is no framework runtime and no vendor script loaded before this.
// See README.md for what replaced what.
import { initTheme } from "./widgets/theme.js";
import { initReveal } from "./widgets/reveal.js";
import { initNav } from "./widgets/nav.js";
import { initModals } from "./widgets/modal.js";
import { initHeroSlider } from "./widgets/heroSlider.js";
import { initJourneySlider } from "./widgets/journeySlider.js";
import { initTabs } from "./widgets/tabs.js";
import { initReviewLightbox } from "./widgets/reviewLightbox.js";
import { initBgVideoControl } from "./widgets/bgVideoControl.js";
import { initForms } from "./widgets/forms.js";

initTheme();
initReveal();
initNav();
initModals();
initHeroSlider();
initJourneySlider();
initTabs();
initReviewLightbox();
initBgVideoControl();
initForms();

if (import.meta.hot) {
  import.meta.hot.accept();
}
