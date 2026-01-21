// app.theme.js
// =====================================
// 暗夜模式模块（独立）
// 负责：主题切换 + 恢复
// =====================================

/* ============================
   读取主题
============================ */
let currentTheme = localStorage.getItem("fitness_theme") || "light";

/* ============================
   应用主题
============================ */
function applyTheme(theme) {
  currentTheme = theme;

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  localStorage.setItem("fitness_theme", theme);
}

/* ============================
   启动时恢复主题
============================ */
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(currentTheme);
});

/* ============================
   绑定主题按钮
============================ */
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  themeToggle.onclick = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  };
}
