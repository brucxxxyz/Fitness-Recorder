// =====================================
// 三语言系统（UI + 动作 + 部位 + 统计页 + 六维能力）
// =====================================

/* ============================
   当前语言（默认 zh）
============================ */
let currentLang = localStorage.getItem("fitness_lang") || "zh";

/* ============================
   UI 文案翻译
============================ */
const UI_TEXT = {
  zh: {
    homeTitle: "今日训练",
    historyTitle: "历史记录",
    statsTitle: "训练统计",

    date: "日期",
    part: "部位",

    btnHistory: "查看历史记录",
    btnStats: "训练统计",
    btnBack: "返回",
    btnDeleteDay: "删除当天数据",

    week: "每周",
    month: "每月",
    bar: "柱状图（能量）",
    radar: "雷达图（六维）",

    summary: (sets, reps, cal) => `
      <div>今日总组数： <b>${sets}</b> 组</div>
      <div>今日总次数： <b>${reps}</b> 次</div>
      <div>今日总能量： <b>${cal.toFixed(1)}</b> kcal</div>
    `
  },

  hk: {
    homeTitle: "今日訓練",
    historyTitle: "歷史記錄",
    statsTitle: "訓練統計",

    date: "日期",
    part: "部位",

    btnHistory: "查看歷史記錄",
    btnStats: "訓練統計",
    btnBack: "返回",
    btnDeleteDay: "刪除當天數據",

    week: "每週",
    month: "每月",
    bar: "柱狀圖（能量）",
    radar: "雷達圖（六維）",

    summary: (sets, reps, cal) => `
      <div>今日總組數： <b>${sets}</b> 組</div>
      <div>今日總次數： <b>${reps}</b> 次</div>
      <div>今日總能量： <b>${cal.toFixed(1)}</b> kcal</div>
    `
  },

  en: {
    homeTitle: "Today's Workout",
    historyTitle: "History",
    statsTitle: "Statistics",

    date: "Date",
    part: "Body Part",

    btnHistory: "View History",
    btnStats: "Statistics",
    btnBack: "Back",
    btnDeleteDay: "Delete This Day",

    week: "Weekly",
    month: "Monthly",
    bar: "Bar Chart (Energy)",
    radar: "Radar Chart (6D)",

    summary: (sets, reps, cal) => `
      <div>Total Sets: <b>${sets}</b></div>
      <div>Total Reps: <b>${reps}</b></div>
      <div>Total Energy: <b>${cal.toFixed(1)}</b> kcal</div>
    `
  }
};

/* ============================
   六维能力翻译
============================ */
const DIM_TRANSLATIONS = {
  balance:      { zh: "平衡",   hk: "平衡",   en: "Balance" },
  power:        { zh: "爆发力", hk: "爆發力", en: "Power" },
  endurance:    { zh: "耐力",   hk: "耐力",   en: "Endurance" },
  flexibility:  { zh: "柔韧",   hk: "柔韌",   en: "Flexibility" },
  stability:    { zh: "稳定",   hk: "穩定",   en: "Stability" },
  coordination: { zh: "协调",   hk: "協調",   en: "Coordination" }
};

function getLocalizedDimension(dim) {
  return DIM_TRANSLATIONS[dim]?.[currentLang] || dim;
}

/* ============================
   获取翻译（动作 / 部位）
============================ */
function getLocalizedPart(part) {
  return PART_TRANSLATION[part]?.[currentLang] || part;
}

function getLocalizedWorkout(name) {
  return WORKOUT_TRANSLATION[name]?.[currentLang] || name;
}

/* ============================
   翻译今日训练动作列表
============================ */
function translateTodayList() {
  document.querySelectorAll(".subitem-row .item-name").forEach(el => {
    const original = el.dataset.originalName || el.textContent;
    el.dataset.originalName = original;
    el.textContent = getLocalizedWorkout(original);
  });
}

/* ============================
   翻译部位下拉菜单
============================ */
function translatePartSelect() {
  const sel = document.getElementById("bodyPartSelect");
  if (!sel) return;

  [...sel.options].forEach(opt => {
    const original = opt.value;
    opt.textContent = getLocalizedPart(original);
  });
}

/* ============================
   翻译历史记录
============================ */
function translateHistoryList() {
  document.querySelectorAll("#historyList .item-name").forEach(el => {
    const original = el.dataset.originalName || el.textContent;
    el.dataset.originalName = original;
    el.textContent = getLocalizedWorkout(original);
  });
}

/* ============================
   翻译今日统计
============================ */
function translateSummary() {
  const box = document.getElementById("todaySummary");
  if (!box) return;

  const date = document.getElementById("datePicker")?.value;
  const todayData = history[date] || {};

  let totalSets = 0;
  let totalReps = 0;
  let totalCalories = 0;

  for (const name in todayData) {
    const sets = todayData[name];
    const reps = findReps(name);
    totalSets += sets;
    totalReps += sets * reps;
    totalCalories += sets * reps * 0.6;
  }

  box.innerHTML = UI_TEXT[currentLang].summary(totalSets, totalReps, totalCalories);
}

/* ============================
   翻译 UI（主页 + 历史页 + 统计页）
============================ */
function translateUI() {
  const t = UI_TEXT[currentLang];

  // 主页标题
  const homeTitle = document.querySelector("#page-home .page-title");
  if (homeTitle) homeTitle.textContent = t.homeTitle;

  // 历史页标题
  const historyTitle = document.querySelector("#page-history .page-title");
  if (historyTitle) historyTitle.textContent = t.historyTitle;

  // 统计页标题（只匹配 .stats-title）
  const statsTitle = document.querySelector(".stats-title");
  if (statsTitle) statsTitle.textContent = t.statsTitle;

  // 按钮翻译
  const btnHistory = document.getElementById("gotoHistory");
  const btnStats = document.getElementById("gotoStats");
  const btnBack = document.getElementById("backHome");

  if (btnHistory) btnHistory.textContent = t.btnHistory;
  if (btnStats) btnStats.textContent = t.btnStats;
  if (btnBack) btnBack.textContent = t.btnBack;

  // 统计页按钮
  const btnWeek = document.getElementById("btnWeek");
  const btnMonth = document.getElementById("btnMonth");
  const btnBar = document.getElementById("btnBar");
  const btnRadar = document.getElementById("btnRadar");
  const btnBackStats = document.getElementById("btnBack");

  if (btnWeek) btnWeek.textContent = t.week;
  if (btnMonth) btnMonth.textContent = t.month;
  if (btnBar) btnBar.textContent = t.bar;
  if (btnRadar) btnRadar.textContent = t.radar;
  if (btnBackStats) btnBackStats.textContent = t.btnBack;
}

/* ============================
   图表标题接口
============================ */
function getChartTitle(type) {
  const t = UI_TEXT[currentLang];
  if (type === "bar") return t.bar;
  if (type === "radar") return t.radar;
  return "";
}

/* ============================
   主入口：应用语言
============================ */
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("fitness_lang", lang);

  translateUI();
  translatePartSelect();
  translateTodayList();
  translateHistoryList();
  translateSummary();
}

/* ============================
   启动时恢复语言
============================ */
document.addEventListener("DOMContentLoaded", () => {
  applyLanguage(currentLang);
});

/* ============================
   绑定语言按钮
============================ */
const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");
const langWrapper = document.querySelector(".lang-wrapper");

if (langBtn && langMenu) {

  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    langMenu.classList.toggle("hidden");
  });

  langMenu.querySelectorAll("[data-lang]").forEach(item => {
    item.addEventListener("click", () => {
      applyLanguage(item.dataset.lang);
      langMenu.classList.add("hidden");
    });
  });

  document.addEventListener("click", (e) => {
    if (!langWrapper.contains(e.target)) {
      langMenu.classList.add("hidden");
    }
  });
}
