// The reviews row scrolls forever: the cards are duplicated once (the copy is
// hidden from assistive tech) and CSS animates the track by -50%, see
// .marquee__track in src/styles/sections.css.
export function initMarquee() {
  document.querySelectorAll("[data-marquee]").forEach((root) => {
    const track = root.querySelector("[data-marquee-track]");
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    [...track.children].forEach((card) => {
      const copy = card.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      track.append(copy);
    });
  });
}
