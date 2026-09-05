// Journey section: a manual carousel (prev/next arrows + dots), one slide
// visible at a time, sliding via transform on the mask's inner track.
export function initJourneySlider() {
  const root = document.querySelector(".journey-slider");
  if (!root) return;

  const track = root.querySelector(".journey-slider-wrapper");
  const slides = Array.from(track?.querySelectorAll(".wg-slide") ?? []);
  const dots = Array.from(root.querySelectorAll(".wg-slider-dot"));
  const prev = root.querySelector(".wg-slider-arrow-left");
  const next = root.querySelector(".wg-slider-arrow-right");
  const live = root.querySelector(".wg-slider-aria-label");
  if (!track || slides.length < 2) return;

  let index = dots.findIndex((d) => d.classList.contains("wg-active"));
  if (index < 0) index = 0;

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((slide, i) => {
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("wg-active", i === index);
      dot.setAttribute("aria-pressed", i === index ? "true" : "false");
      dot.setAttribute("tabindex", i === index ? "0" : "-1");
    });
    if (live) live.textContent = `Slide ${index + 1} of ${slides.length}.`;
  };

  const go = (i) => {
    index = (i + slides.length) % slides.length;
    render();
  };

  prev?.addEventListener("click", () => go(index - 1));
  next?.addEventListener("click", () => go(index + 1));
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => go(i));
    dot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go(i);
      }
    });
  });

  render();
}
