const DEFAULT_LANG = "en";
const STORAGE_KEY = "git-hired-lang";

function getStoredLanguage() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "zh" ? "zh" : DEFAULT_LANG;
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
  const next = lang === "zh" ? "zh" : "en";
  document.body.dataset.lang = next;
  document.body.classList.remove("lang-en", "lang-zh");
  document.body.classList.add(`lang-${next}`);
  document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  window.localStorage.setItem(STORAGE_KEY, next);

  if (document.body.dataset.titleEn && document.body.dataset.titleZh) {
    document.title = next === "zh" ? document.body.dataset.titleZh : document.body.dataset.titleEn;
  }

  updateLanguageButtons(next);
  updateCopyButtons(next);
}

function copyPrompt(promptBase, button) {
  const lang = document.body.dataset.lang || DEFAULT_LANG;
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
  setLanguage(getStoredLanguage());
});
