// Journey section: a manual carousel (prev/next arrows + dots), one slide
// visible at a time, sliding via transform on the mask's inner track.
// Touch/mouse drag (Pointer Events) is layered on top of the same `go()`
// used by the arrows/dots, so a swipe lands on exactly the same slide a
// click would.
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
  let dragOffset = 0; // live drag distance in px, added on top of the active index

  const render = () => {
    track.style.transform = `translateX(calc(-${index * 100}% + ${dragOffset}px))`;
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
    dragOffset = 0;
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

  // Drag / swipe. `touch-action: pan-y` (custom.css) tells the browser to
  // keep handling vertical page scrolling itself; horizontal vs. vertical
  // intent is then decided here from the first ~10px of movement, so a
  // mostly-vertical swipe is left alone and still scrolls the page.
  if (!window.PointerEvent) return;

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let horizontal = null; // null = undecided yet, true/false once past the deadzone

  track.addEventListener("pointerdown", (e) => {
    if (pointerId !== null) return; // ignore a second finger mid-drag
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    horizontal = null;
    dragOffset = 0;
  });

  track.addEventListener("pointermove", (e) => {
    if (e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (horizontal === null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal) {
        track.setPointerCapture(pointerId);
        track.classList.add("is-dragging");
      } else {
        pointerId = null; // hand back to the browser's own vertical scroll
        return;
      }
    }

    e.preventDefault();
    dragOffset = dx;
    render();
  });

  const endDrag = (e) => {
    if (e.pointerId !== pointerId) return;
    track.classList.remove("is-dragging");
    if (horizontal) {
      const width = track.clientWidth || 1;
      const delta = dragOffset / width;
      if (delta <= -0.15) go(index + 1);
      else if (delta >= 0.15) go(index - 1);
      else go(index);
    }
    pointerId = null;
    horizontal = null;
  };

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
}
