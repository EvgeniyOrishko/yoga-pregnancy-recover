// The studio card starts inset with rounded corners and grows to full bleed as
// it scrolls up past the middle of the viewport. This only writes --expand (0..1)
// on the [data-expand] wrapper; the geometry lives in .studio-wrap / .studio
// in src/styles/sections.css. Mobile has no inset, so it is skipped there.
export function initExpand() {
  const wrap = document.querySelector("[data-expand]");
  if (!wrap) return;

  const wide = window.matchMedia("(min-width: 810px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  const update = () => {
    ticking = false;
    if (!wide.matches || reduced.matches) {
      wrap.style.removeProperty("--expand");
      return;
    }
    const vh = window.innerHeight;
    const raw = (vh * 0.55 - wrap.getBoundingClientRect().top) / (vh * 0.25);
    const p = Math.min(1, Math.max(0, raw));
    wrap.style.setProperty("--expand", (p * p * (3 - 2 * p)).toFixed(3));
  };

  const request = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();
}
