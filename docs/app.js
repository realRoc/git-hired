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

function updateCopyButtons(lang) {
  document.querySelectorAll("[data-copy-button]").forEach((button) => {
    button.innerText = lang === "zh" ? button.dataset.labelZh : button.dataset.labelEn;
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
  updateCopyButtons(next);

  document.dispatchEvent(new CustomEvent("git-hired:languagechange", {
    detail: { lang: next },
  }));
}

function copyPrompt(promptBase, button) {
  const lang = document.body?.dataset.lang || document.documentElement.dataset.lang || DEFAULT_LANG;
  const prompt = document.getElementById(`${promptBase}-${lang}`);
  if (!prompt) return;

  navigator.clipboard.writeText(prompt.innerText).then(() => {
    const copied = lang === "zh" ? button.dataset.copiedZh : button.dataset.copiedEn;
    const label = lang === "zh" ? button.dataset.labelZh : button.dataset.labelEn;
    button.innerText = copied;
    setTimeout(() => {
      button.innerText = label;
    }, 1800);
  }).catch(() => {
    const failed = lang === "zh" ? button.dataset.failedZh : button.dataset.failedEn;
    const label = lang === "zh" ? button.dataset.labelZh : button.dataset.labelEn;
    button.innerText = failed;
    setTimeout(() => {
      button.innerText = label;
    }, 1800);
  });
}

window.setLanguage = setLanguage;
window.copyPrompt = copyPrompt;

document.addEventListener("DOMContentLoaded", () => {
  applyDocumentLanguage(getPreferredLanguage());
  setLanguage(document.documentElement.dataset.lang || DEFAULT_LANG);
});
