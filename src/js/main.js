// Every interactive behaviour on the page lives here (or in ./widgets/) -
// there is no framework runtime. The one vendor script loaded before this
// is WayForPay's own required checkout widget (index.html) - see
// widgets/wayforpay.js. See README.md for what replaced what.
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
import { initWayforpay } from "./widgets/wayforpay.js";

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
initWayforpay();

if (import.meta.hot) {
  import.meta.hot.accept();
}
