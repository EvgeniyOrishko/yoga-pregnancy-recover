// FAQ accordion. Each item is a button (aria-expanded) controlling a panel;
// the open state is mirrored as .is-open on the item so CSS can animate the
// panel height (see .faq__panel in src/styles/sections.css).
export function initAccordion() {
  document.querySelectorAll("[data-accordion]").forEach((list) => {
    list.querySelectorAll(".faq__item").forEach((item) => {
      const toggle = item.querySelector(".faq__toggle");
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        item.classList.toggle("is-open", open);
      });
    });
  });
}
