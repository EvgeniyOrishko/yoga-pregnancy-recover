// Weekday tabs in the timetable section. `.wg-tab-pane` defaults to
// display:none and `.wg--tab-active` shows it (both rules kept from the
// original stylesheet, see base.css) - this just swaps which pane/link
// carries those classes.
export function initTabs() {
  document.querySelectorAll(".wg-tabs").forEach((root) => {
    const links = Array.from(root.querySelectorAll(".wg-tab-link"));
    const panes = Array.from(root.querySelectorAll(".wg-tab-pane"));
    if (!links.length || !panes.length) return;

    const activate = (link) => {
      const paneId = link.getAttribute("href")?.slice(1);
      const pane = paneId ? document.getElementById(paneId) : null;
      if (!pane) return;

      links.forEach((l) => {
        l.classList.remove("wg--current");
        l.setAttribute("aria-selected", "false");
        l.setAttribute("tabindex", "-1");
      });
      panes.forEach((p) => p.classList.remove("wg--tab-active"));

      link.classList.add("wg--current");
      link.setAttribute("aria-selected", "true");
      link.setAttribute("tabindex", "0");
      pane.classList.add("wg--tab-active");
    };

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        activate(link);
      });
    });
  });
}
