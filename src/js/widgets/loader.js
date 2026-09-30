// Cream intro screen. The emblem draws itself in CSS (see .loader in
// src/styles/sections.css); this lifts the screen once the page has loaded and
// the drawing has finished, then flies the emblem onto the header logo slot
// (measure both, animate a translate+scale between them). If this script never
// runs, a CSS fail-safe hides the loader on its own.
const MIN_MS = 900; // measured from navigation start: the drawing takes ~0.7s
const MAX_MS = 6000; // never keep the page covered longer than this
const FLIGHT_MS = 550;

export function initLoader() {
  const el = document.querySelector("[data-loader]");
  if (!el) return;

  const emblem = el.querySelector(".loader__emblem");
  const target = document.querySelector(".site-header .logo__symbol");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finish = () => {
    el.hidden = true;
  };

  const land = () => {
    el.classList.add("is-done"); // fades the cream screen
    if (!emblem || !target || reduced) {
      setTimeout(finish, 450);
      return;
    }
    const from = emblem.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const color = getComputedStyle(target).color;
    emblem
      .animate(
        [
          { transform: "none" },
          {
            transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`,
            color,
          },
        ],
        { duration: FLIGHT_MS, easing: "cubic-bezier(0.65, 0, 0.25, 1)", fill: "forwards" },
      )
      .finished.then(finish, finish);
    // Safety net: never leave the page covered if the animation promise stalls.
    setTimeout(finish, FLIGHT_MS + 400);
  };

  const loaded = new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });
  const capped = Promise.race([
    loaded,
    new Promise((resolve) => setTimeout(resolve, MAX_MS - performance.now())),
  ]);

  capped.then(() => {
    const wait = reduced ? 0 : Math.max(0, MIN_MS - performance.now());
    setTimeout(land, wait);
  });
}
