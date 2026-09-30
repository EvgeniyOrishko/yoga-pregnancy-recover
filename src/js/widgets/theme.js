// Colour switcher. The whole site is styled from three CSS variables (--bg,
// --primary, --accent, see src/styles/tokens.css); this lets you pick a preset
// or mix your own from the palette and writes the result onto <html>. The
// chosen values are also saved as ready-made variables, so the inline script
// in index.html can restore them before first paint (no flash of the old theme).
const STORAGE_KEY = "site-theme";

const LIGHT = "#faf6f0";
const DARK = "#23292d";
const INK_DARK = "#383530";
const INK_LIGHT = "#f8efde";

// Palette used by the pickers: the three colour groups from the brief plus the
// original site colours.
const PALETTE = [
  ["#faf6f0", "Крем"],
  ["#f8efde", "Слонова кістка"],
  ["#c8c3b0", "Льон"],
  ["#e3c0ad", "Персик"],
  ["#bdf9e1", "М'ята"],
  ["#96e0d2", "Аква"],
  ["#2d8ba0", "Лагуна"],
  ["#2e4a5f", "Ніч"],
  ["#476b64", "Шавлія"],
  ["#ba6562", "Корал"],
];

const PRESETS = [
  { name: "Оригінал", bg: "#faf6f0", primary: "#2e4a5f", accent: "#e3c0ad" },
  { name: "Лагуна", bg: "#f8efde", primary: "#2d8ba0", accent: "#e3c0ad" },
  { name: "Морське скло", bg: "#f8efde", primary: "#2e4a5f", accent: "#96e0d2" },
  { name: "Персик", bg: "#e3c0ad", primary: "#2e4a5f", accent: "#2d8ba0" },
  { name: "М'ята", bg: "#bdf9e1", primary: "#2e4a5f", accent: "#2d8ba0" },
  { name: "Льон", bg: "#c8c3b0", primary: "#2e4a5f", accent: "#2d8ba0" },
  { name: "Ніч", bg: "#2e4a5f", primary: "#96e0d2", accent: "#e3c0ad" },
];

const ROWS = [
  ["bg", "Фон"],
  ["primary", "Основний"],
  ["accent", "Акцент"],
];

const ORIGINAL = PRESETS[0];

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Readable text colour for a fill: light text unless it would be too faint.
const textOn = (fill) => (contrast(LIGHT, fill) >= 3.2 ? LIGHT : DARK);

function toVars({ bg, primary, accent }) {
  const darkTheme = contrast(INK_DARK, bg) < 4.5;
  return {
    "--bg": bg,
    "--primary": primary,
    "--accent": accent,
    "--ink": darkTheme ? INK_LIGHT : INK_DARK,
    "--on-primary": textOn(primary),
    "--on-accent": textOn(accent),
    "--card": darkTheme ? `color-mix(in srgb, ${bg} 88%, #fff)` : "#fff",
  };
}

const same = (a, b) => a.bg === b.bg && a.primary === b.primary && a.accent === b.accent;

export function initTheme() {
  const root = document.documentElement;
  const btn = document.querySelector(".theme-btn");
  const panel = document.querySelector("#theme-panel");
  if (!btn || !panel) return;

  const presetsEl = panel.querySelector("[data-theme-presets]");
  const mixEl = panel.querySelector("[data-theme-mix]");

  let state = { ...ORIGINAL };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.state) state = { ...ORIGINAL, ...saved.state };
  } catch {
    // ignore unreadable storage
  }

  const apply = (next) => {
    state = { ...next };
    const vars = toVars(state);
    if (same(state, ORIGINAL)) {
      Object.keys(vars).forEach((k) => root.style.removeProperty(k));
      localStorage.removeItem(STORAGE_KEY);
    } else {
      Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, vars }));
    }
    refresh();
  };

  // ---- presets
  const presetButtons = PRESETS.map((p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "theme-preset";
    b.innerHTML =
      `<span class="theme-preset__dots">` +
      [p.bg, p.primary, p.accent].map((c) => `<i style="background:${c}"></i>`).join("") +
      `</span><span>${p.name}</span>`;
    b.addEventListener("click", () => apply(p));
    presetsEl.append(b);
    return b;
  });

  // ---- mix rows
  const rowButtons = {};
  const customInputs = {};
  ROWS.forEach(([key, label]) => {
    const row = document.createElement("div");
    row.className = "theme-row";
    row.innerHTML = `<span class="theme-row__label">${label}</span>`;
    const swatches = document.createElement("div");
    swatches.className = "theme-row__swatches";
    rowButtons[key] = PALETTE.map(([hex, name]) => {
      const s = document.createElement("button");
      s.type = "button";
      s.className = "theme-swatch";
      s.style.background = hex;
      s.title = name;
      s.setAttribute("aria-label", `${label}: ${name}`);
      s.addEventListener("click", () => apply({ ...state, [key]: hex }));
      swatches.append(s);
      return [hex, s];
    });
    const custom = document.createElement("input");
    custom.type = "color";
    custom.className = "theme-swatch theme-swatch--custom";
    custom.setAttribute("aria-label", `${label}: свій колір`);
    custom.addEventListener("input", () => apply({ ...state, [key]: custom.value }));
    customInputs[key] = custom;
    swatches.append(custom);
    row.append(swatches);
    mixEl.append(row);
  });

  const refresh = () => {
    PRESETS.forEach((p, i) =>
      presetButtons[i].setAttribute("aria-pressed", String(same(state, p))),
    );
    ROWS.forEach(([key]) => {
      rowButtons[key].forEach(([hex, s]) =>
        s.setAttribute("aria-pressed", String(hex === state[key])),
      );
      customInputs[key].value = state[key];
    });
  };

  // ---- extra buttons
  const random = document.createElement("button");
  random.type = "button";
  random.className = "theme-panel__random";
  random.textContent = "Випадково";
  random.addEventListener("click", () => {
    const pick = () => PALETTE[Math.floor(Math.random() * PALETTE.length)][0];
    let next;
    // Keep it usable: background and primary must contrast, and differ from the accent.
    do {
      next = { bg: pick(), primary: pick(), accent: pick() };
    } while (
      contrast(next.bg, next.primary) < 3 ||
      next.accent === next.bg ||
      next.accent === next.primary
    );
    apply(next);
  });
  panel.querySelector("[data-theme-reset]").before(random);
  panel.querySelector("[data-theme-reset]").addEventListener("click", () => apply(ORIGINAL));

  // ---- open / close
  const setOpen = (open) => {
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  };
  btn.addEventListener("click", () => setOpen(panel.hidden));
  document.addEventListener("click", (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      setOpen(false);
      btn.focus();
    }
  });

  refresh();
}
