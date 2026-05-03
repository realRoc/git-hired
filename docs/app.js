const DEFAULT_LANG = "en";
const STORAGE_KEY = "git-hired-lang";

function normalizeLanguage(value) {
  return value === "zh" ? "zh" : "en";
}

function getStoredLanguage() {
  try {
    return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    return DEFAULT_LANG;
  }
}

function detectBrowserLanguage() {
  const candidates = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || ""];
  return candidates.some((value) => /^zh\b/i.test(String(value || "").trim())) ? "zh" : DEFAULT_LANG;
}

function getPreferredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") {
      return stored;
    }
  } catch (error) {
    // Ignore storage failures and fall back to browser language.
  }
  return detectBrowserLanguage();
}

function applyDocumentLanguage(lang) {
  const next = normalizeLanguage(lang);
  document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  document.documentElement.dataset.lang = next;
  return next;
}

function updateLanguageButtons(lang) {
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    const active = button.dataset.langButton === lang;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function setLanguage(lang) {
  const next = applyDocumentLanguage(lang);

  if (document.body) {
    document.body.dataset.lang = next;
    document.body.classList.remove("lang-en", "lang-zh");
    document.body.classList.add(`lang-${next}`);
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch (error) {
    // Ignore storage failures and still apply the resolved language for this session.
  }

  if (document.body && document.body.dataset.titleEn && document.body.dataset.titleZh) {
    document.title = next === "zh" ? document.body.dataset.titleZh : document.body.dataset.titleEn;
  }

  updateLanguageButtons(next);
}

window.setLanguage = setLanguage;

/* ——— ASCII banner — ANSI Shadow "GIT-HIRED" + live typing ——— */

const ASCII_WIDE = [
"  ██████╗ ██╗████████╗       ██╗  ██╗██╗██████╗ ███████╗██████╗ ",
"  ██╔════╝ ██║╚══██╔══╝       ██║  ██║██║██╔══██╗██╔════╝██╔══██╗",
"  ██║  ███╗██║   ██║          ███████║██║██████╔╝█████╗  ██║  ██║",
"  ██║   ██║██║   ██║          ██╔══██║██║██╔══██╗██╔══╝  ██║  ██║",
"  ╚██████╔╝██║   ██║          ██║  ██║██║██║  ██║███████╗██████╔╝",
"   ╚═════╝ ╚═╝   ╚═╝          ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ",
].join("\n");

const ASCII_STACK = [
"  ██████╗ ██╗████████╗",
"  ██╔════╝ ██║╚══██╔══╝",
"  ██║  ███╗██║   ██║   ",
"  ██║   ██║██║   ██║   ",
"  ╚██████╔╝██║   ██║   ",
"   ╚═════╝ ╚═╝   ╚═╝   ",
"  ██╗  ██╗██╗██████╗ ███████╗██████╗ ",
"  ██║  ██║██║██╔══██╗██╔════╝██╔══██╗",
"  ███████║██║██████╔╝█████╗  ██║  ██║",
"  ██╔══██║██║██╔══██╗██╔══╝  ██║  ██║",
"  ██║  ██║██║██║  ██║███████╗██████╔╝",
"  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ",
].join("\n");

function pickAsciiArt() {
  return window.matchMedia && window.matchMedia("(max-width: 620px)").matches
    ? ASCII_STACK
    : ASCII_WIDE;
}

let asciiTypingTimer = null;
let asciiAnimated = false;

function typeAscii(target, art, speed) {
  if (asciiTypingTimer) clearInterval(asciiTypingTimer);
  const banner = target.closest(".ascii-banner");
  const inner = target;
  inner.textContent = "";
  banner && banner.classList.add("typing");

  // Reveal in chunks (4–6 chars per tick) so it feels fast but still "typed"
  let i = 0;
  const total = art.length;
  const chunk = Math.max(3, Math.floor(total / 220));
  asciiTypingTimer = setInterval(() => {
    i = Math.min(total, i + chunk);
    inner.textContent = art.slice(0, i);
    if (i >= total) {
      clearInterval(asciiTypingTimer);
      asciiTypingTimer = null;
      setTimeout(() => banner && banner.classList.remove("typing"), 180);
    }
  }, speed || 14);
}

function renderAsciiBanner(animate) {
  const banner = document.getElementById("asciiBanner");
  if (!banner) return;
  const inner = banner.querySelector(".ascii-inner");
  if (!inner) return;
  const art = pickAsciiArt();

  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typeAscii(inner, art, 14);
    asciiAnimated = true;
  } else {
    inner.textContent = art;
  }
}

function initAsciiBanner() {
  const banner = document.getElementById("asciiBanner");
  const caret = document.getElementById("asciiCaret");
  if (!banner || !caret) return;

  renderAsciiBanner(true);

  // hover re-types, throttled
  let hoverLock = false;
  banner.addEventListener("mouseenter", () => {
    if (hoverLock) return;
    hoverLock = true;
    const inner = banner.querySelector(".ascii-inner");
    if (inner) typeAscii(inner, pickAsciiArt(), 10);
    setTimeout(() => { hoverLock = false; }, 1200);
  });

  // CRT toggle via caret click
  try {
    if (window.localStorage.getItem("git-hired-crt") === "1") {
      document.body.classList.add("crt");
    }
  } catch (e) {}

  caret.addEventListener("click", (e) => {
    e.stopPropagation();
    document.body.classList.toggle("crt");
    try {
      window.localStorage.setItem(
        "git-hired-crt",
        document.body.classList.contains("crt") ? "1" : "0"
      );
    } catch (err) {}
  });

  // Redraw on breakpoint change (wide <-> stack), no animation
  let lastStack = window.matchMedia("(max-width: 620px)").matches;
  window.addEventListener("resize", () => {
    const nowStack = window.matchMedia("(max-width: 620px)").matches;
    if (nowStack !== lastStack) {
      lastStack = nowStack;
      renderAsciiBanner(false);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyDocumentLanguage(getPreferredLanguage());
  setLanguage(document.documentElement.dataset.lang || DEFAULT_LANG);
  initAsciiBanner();
});
