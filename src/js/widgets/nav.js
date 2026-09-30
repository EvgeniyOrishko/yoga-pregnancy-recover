// Header behaviour: on desktop the bar is transparent over the hero and turns
// into a frosted pill once the page scrolls (.is-scrolled); below 1200px the
// burger toggles the dropdown menu (.is-open). All the visuals are CSS.
const DESKTOP = window.matchMedia("(min-width: 1200px)");

export function initNav() {
  const header = document.querySelector(".site-header");
  const burger = header?.querySelector(".burger");
  if (!header || !burger) return;

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  burger.addEventListener("click", () => setOpen(!header.classList.contains("is-open")));

  // Close after following a link, on Escape, on an outside click, and when
  // the viewport grows into the desktop layout.
  header
    .querySelectorAll(".mobile-menu a")
    .forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target)) setOpen(false);
  });
  DESKTOP.addEventListener("change", () => setOpen(false));
}
