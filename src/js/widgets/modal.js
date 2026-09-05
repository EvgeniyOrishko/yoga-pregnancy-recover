// Generic open/close for every `.modal` on the page (the contact-form
// modal, plus one per instructor bio). `.modal` defaults to display:none in
// base.css; `.is-open` (custom.css) makes it visible and fades it in.
export function initModals() {
  const modals = document.querySelectorAll(".modal");
  if (!modals.length) return;

  const openModal = (modal) => {
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close, [class*='modal-close']")?.focus();
  };
  const closeModal = (modal) => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  modals.forEach((modal) => {
    modal.querySelector(".modal-overlay")?.addEventListener("click", () => closeModal(modal));
    modal.querySelector(".modal-close")?.addEventListener("click", () => closeModal(modal));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal.is-open").forEach(closeModal);
  });

  // Each instructor card opens its own sibling `.modal.modal-instructor`.
  document.querySelectorAll(".instructor-card").forEach((card) => {
    const modal = card.parentElement?.querySelector(".modal.modal-instructor");
    if (!modal) return;
    card.style.cursor = "pointer";
    card.addEventListener("click", () => openModal(modal));
  });
}
