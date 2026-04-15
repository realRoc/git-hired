function copyPrompt(promptId, button) {
  const prompt = document.getElementById(promptId);
  if (!prompt) return;

  const text = prompt.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const original = button.innerText;
    button.innerText = "已复制";
    setTimeout(() => {
      button.innerText = original;
    }, 1800);
  }).catch(() => {
    button.innerText = "复制失败";
    setTimeout(() => {
      button.innerText = "复制 Prompt";
    }, 1800);
  });
}
