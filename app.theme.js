// =====================================
// 暗夜模式模块（独立）
// 负责：主题切换 + 恢复
// =====================================

/* ============================
   读取主题
============================ */
let currentTheme = localStorage.getItem("fitness_theme") || "light";

/* ============================
   应用主题 + 更新按钮图标
============================ */
function applyTheme(theme) {
  currentTheme = theme;

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    updateThemeIcon("dark");
  } else {
    document.documentElement.classList.remove("dark");
    updateThemeIcon("light");
  }

  localStorage.setItem("fitness_theme", theme);
}

/* ============================
   更新按钮图标（🌙 ↔ ☀️）
============================ */
function updateThemeIcon(theme) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

/* ============================
   启动时恢复主题
============================ */
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(currentTheme);
});

/* ============================
   绑定主题按钮（修复版）
============================ */
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  });
}
