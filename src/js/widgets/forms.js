// Form submit handling for every `.wg-form` (contact form, newsletter
// signup, per-instructor contact modal). There is no backend behind this
// site - submitting only runs native HTML5 validation, then swaps the form
// out for the .wg-form-done / .wg-form-fail message, exactly like Webflow's
// own form component did. Point `form.action` at a real endpoint (or wire
// up `fetch` here) before you rely on this in production.
export function initForms() {
  document.querySelectorAll(".wg-form").forEach((wrapper) => {
    const form = wrapper.querySelector("form");
    const done = wrapper.querySelector(".wg-form-done");
    const fail = wrapper.querySelector(".wg-form-fail");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      fail && (fail.style.display = "none");

      if (!form.checkValidity()) {
        form.reportValidity();
        fail && (fail.style.display = "block");
        return;
      }

      form.style.display = "none";
      if (done) done.style.display = "block";
    });
  });
}
