// ui.js
// 全局 UI：语言切换 + 暗夜模式 + t() 函数

/* ============================
   当前语言
============================ */
window.currentLang = localStorage.getItem("lang") || "zh";

/* ============================
   翻译函数
============================ */
window.t = function (key, vars = {}) {
  let text = LANG[currentLang][key] || key;
  for (const k in vars) {
    text = text.replace(`{${k}}`, vars[k]);
  }
  return text;
};

/* ============================
   语言菜单逻辑
============================ */
window.initLanguageMenu = function () {
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");

  if (!langBtn || !langMenu) return;

  langBtn.onclick = () => {
    langMenu.classList.toggle("hidden");
  };

  langMenu.querySelectorAll("[data-lang]").forEach(item => {
    item.onclick = () => {
      const lang = item.dataset.lang;
      localStorage.setItem("lang", lang);
      location.reload();
    };
  });

  document.addEventListener("click", (e) => {
    if (!langMenu.contains(e.target) && e.target !== langBtn) {
      langMenu.classList.add("hidden");
    }
  });
};

/* ============================
   暗夜模式（切换 html.dark）
============================ */
window.initDarkMode = function () {
  let dark = localStorage.getItem("dark") === "1";

  function applyDark() {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  applyDark();

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.onclick = () => {
    dark = !dark;
    localStorage.setItem("dark", dark ? "1" : "0");
    applyDark();
  };
};
