// Two carousels share the [data-carousel] hook:
//   data-carousel="slides"  one full-width slide at a time, with dots, arrows,
//                           looping and swipe (the studio slideshow)
//   data-carousel="scroll"  a native scroll-snap row that the arrows nudge one
//                           card at a time; drag with the mouse, swipe by touch
//                           (the class cards)
export function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    if (root.dataset.carousel === "slides") initSlides(root);
    else initScroller(root);
  });
}

function initSlides(root) {
  const track = root.querySelector("[data-carousel-track]");
  const slides = [...track.children];
  const dotsBox = root.querySelector("[data-carousel-dots]");
  let index = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsBox.append(dot);
    return dot;
  });

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-index * 100}%)`;
    slides.forEach((slide, n) => slide.setAttribute("aria-hidden", String(n !== index)));
    dots.forEach((dot, n) => dot.setAttribute("aria-current", String(n === index)));
  }

  root.querySelector("[data-carousel-prev]").addEventListener("click", () => goTo(index - 1));
  root.querySelector("[data-carousel-next]").addEventListener("click", () => goTo(index + 1));

  // Swipe / drag.
  let startX = null;
  root.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    startX = e.clientX;
  });
  root.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
  });
  root.addEventListener("pointercancel", () => (startX = null));

  goTo(0);
}

function initScroller(root) {
  const track = root.querySelector("[data-carousel-track]");
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");

  const step = () => {
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.hidden = track.scrollLeft < 4;
    next.hidden = track.scrollLeft > max - 4;
  };

  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  window.addEventListener("resize", update);

  // Mouse drag (touch already scrolls natively).
  let drag = null;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    if (drag.moved) {
      track.style.scrollSnapType = "none";
      track.scrollLeft = drag.left - dx;
    }
  });
  window.addEventListener("pointerup", () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (!moved) return;
    const target = Math.round(track.scrollLeft / step()) * step();
    track.scrollTo({ left: target, behavior: "smooth" });
    setTimeout(() => (track.style.scrollSnapType = ""), 400);
  });
  // A drag must not count as a click on the card's link/button.
  track.addEventListener(
    "click",
    (e) => {
      if (drag?.moved) e.preventDefault();
    },
    true,
  );
  track.addEventListener("dragstart", (e) => e.preventDefault());

  update();
}
