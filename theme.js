/* ============================
   🌙 Dark Mode (非模块化版本)
============================ */

/* 是否为暗夜模式 */
function isDarkMode() {
  return localStorage.getItem("darkMode") === "true";
}

/* 切换主题 */
function toggleTheme() {
  const newState = !isDarkMode();
  localStorage.setItem("darkMode", newState);

  if (newState) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

/* 初始化主题（页面加载时调用） */
(function initTheme() {
  if (isDarkMode()) {
    document.body.classList.add("dark");
  }
})();
