// Color theme switcher (light / dark / blue). The chosen theme is stored as
// `data-theme` on <html> - custom.css keys every themed rule off that
// attribute. A blocking snippet in index.html's <head> reads the same
// localStorage key and sets the attribute before first paint, so this
// module only has to keep the UI in sync and persist future choices.
const STORAGE_KEY = "yoga-theme";
const THEMES = ["light", "dark", "blue"];

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }

  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    const isActive = button.dataset.themeOption === theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

export function initTheme() {
  const buttons = document.querySelectorAll("[data-theme-option]");
  if (!buttons.length) return;

  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can throw in private-browsing / locked-down contexts - fall
    // back to the default theme silently.
  }
  applyTheme(THEMES.includes(stored) ? stored : "light");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const theme = button.dataset.themeOption;
      if (!THEMES.includes(theme)) return;

      applyTheme(theme);
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // Ignore - the theme still applies for the rest of this visit.
      }
    });
  });
}
