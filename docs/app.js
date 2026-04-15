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

function fillPromptTemplate(template, replacements) {
  let output = template;
  Object.entries(replacements).forEach(([key, value]) => {
    output = output.split(key).join(value);
  });
  return output;
}

function initGeneralEntryBuilder() {
  const root = document.querySelector("[data-general-builder]");
  if (!root) return;

  const currentRole = root.querySelector('[name="current-role"]');
  const targetRole = root.querySelector('[name="target-role"]');
  const promptEn = document.getElementById("prompt-general-en");
  const promptZh = document.getElementById("prompt-general-zh");
  const templateEn = document.getElementById("general-template-en");
  const templateZh = document.getElementById("general-template-zh");
  const copyButtons = root.querySelectorAll("[data-general-copy]");
  const noteEn = root.querySelector("[data-general-mode-note-en]");
  const noteZh = root.querySelector("[data-general-mode-note-zh]");

  if (!currentRole || !targetRole || !promptEn || !promptZh || !templateEn || !templateZh) return;

  function getSelectedMode() {
    const checked = root.querySelector('input[name="scan-mode"]:checked');
    return checked ? checked.value : "history-only";
  }

  function getModeCopy(mode) {
    if (mode === "repo-scan-ready") {
      return {
        en: "open to scanning only specific local repos / files after explicit confirmation",
        zh: "允许在明确确认后，仅扫描你指定的本地 repo / 文件",
        noteEn: "Repo-scan-ready does not mean broad disk access. It still requires explicit in-session approval for specific repos or files, and every approved scan stays local on your machine.",
        noteZh: "支持 repo 扫描不等于放开整机访问。它仍然只会在你明确确认后扫描你指定的 repo 或文件，而且任何批准的扫描都只在你的机器本地运行。",
      };
    }

    return {
      en: "history-only",
      zh: "history-only",
      noteEn: "History-only means the generated prompt should stay inside local AI session history unless you later choose to approve a specific repo or file set.",
      noteZh: "history-only 表示生成后的 prompt 默认只看本地 AI 会话历史，除非你之后主动允许查看指定 repo 或文件集合。",
    };
  }

  function setCopyState(enabled) {
    copyButtons.forEach((button) => {
      button.disabled = !enabled;
      button.setAttribute("aria-disabled", enabled ? "false" : "true");
    });
  }

  function render() {
    const current = currentRole.value.trim();
    const target = targetRole.value.trim();
    const mode = getSelectedMode();
    const modeCopy = getModeCopy(mode);
    const ready = current.length > 0 && target.length > 0;

    if (noteEn) noteEn.textContent = modeCopy.noteEn;
    if (noteZh) noteZh.textContent = modeCopy.noteZh;

    if (!ready) {
      promptEn.innerText = "Fill in your current profession and target profession above to generate the universal prompt.";
      promptZh.innerText = "先在上方填写你当前的职业和目标职业，再生成通用测试 prompt。";
      setCopyState(false);
      return;
    }

    const replacements = {
      "{{CURRENT_PROFESSION}}": current,
      "{{TARGET_PROFESSION}}": target,
      "{{SCAN_MODE_EN}}": modeCopy.en,
      "{{SCAN_MODE_ZH}}": modeCopy.zh,
    };

    promptEn.innerText = fillPromptTemplate(templateEn.textContent.trim(), replacements);
    promptZh.innerText = fillPromptTemplate(templateZh.textContent.trim(), replacements);
    setCopyState(true);
  }

  root.querySelectorAll('input[name="scan-mode"]').forEach((control) => {
    control.addEventListener("change", render);
  });
  [currentRole, targetRole].forEach((control) => {
    control.addEventListener("input", render);
  });

  render();
}

window.setLanguage = setLanguage;
window.copyPrompt = copyPrompt;

document.addEventListener("DOMContentLoaded", () => {
  applyDocumentLanguage(getPreferredLanguage());
  setLanguage(document.documentElement.dataset.lang || DEFAULT_LANG);
  initGeneralEntryBuilder();
});
