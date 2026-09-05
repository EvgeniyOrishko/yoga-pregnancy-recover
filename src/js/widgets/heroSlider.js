// Hero background: autoplaying crossfade through a fixed set of images.
// No arrows/dots in this design (they're `.hidden` on purpose), so this is
// just a timer flipping which `.wg-slide` carries `.is-active`.
export function initHeroSlider() {
  const root = document.querySelector(".hero-background-slider");
  if (!root) return;
  const slides = root.querySelectorAll(".wg-slide");
  if (slides.length < 2) return;

  const delay = Number(root.dataset.delay) || 5000;
  let i = 0;
  slides[0].classList.add("is-active");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  setInterval(() => {
    slides[i].classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-active");
  }, delay);
}
