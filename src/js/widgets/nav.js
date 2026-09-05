// Mobile nav burger toggle. Replaces the original two-button (.burger /
// .burger-close) IX2 click interaction with one accessible toggle button;
// the hamburger->X animation is plain CSS on .burger.is-open (custom.css).
export function initNav() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".header-navigation");
  if (!burger || !nav) return;

  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-controls", "header-navigation");
  nav.id = nav.id || "header-navigation";

  const close = () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "відкрити меню");
  };
  const open = () => {
    nav.classList.add("is-open");
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "закрити меню");
  };

  burger.addEventListener("click", () => {
    (nav.classList.contains("is-open") ? close : open)();
  });

  // Close after following an in-page nav link, and on Escape.
  nav.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
