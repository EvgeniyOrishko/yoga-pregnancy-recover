// Fade/slide elements into place the first time they cross into the
// viewport. Replaces Webflow's IX2 scroll interactions - the visual states
// (.reveal / .reveal.is-visible) live in src/styles/custom.css.
export function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );

  targets.forEach((el) => observer.observe(el));
}
