/* ============================
   初始化
============================ */

let chart;
const ctx = document.getElementById("chartCanvas").getContext("2d");

const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

/* ============================
   🌙 暗夜模式初始化
============================ */
if (isDarkMode()) {
  document.body.classList.add("dark");
  document.getElementById("themeBtn").textContent = "☀️";
}

/* ============================
   🌐 语言菜单
============================ */
const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");

langBtn.onclick = () => {
  langMenu.style.display = langMenu.style.display === "block" ? "none" : "block";
};

document.querySelectorAll(".lang-item").forEach(item => {
  item.onclick = () => {
    const lang = item.dataset.lang;
    setLang(lang);
    langMenu.style.display = "none";
    applyLangStats();
    refreshChart(); // 图表语言也更新
  };
});

/* ============================
   🌙 暗夜模式按钮
============================ */
const themeBtn = document.getElementById("themeBtn");
themeBtn.onclick = () => {
  toggleTheme();
  themeBtn.textContent = isDarkMode() ? "☀️" : "🌙";
  refreshChart(); // 图表颜色更新
};

/* ============================
   🌐 应用语言到统计页
============================ */
function applyLangStats() {
  const L = LANG[currentLang];

  document.getElementById("htmlTitleStats").textContent = L.stats_title;
  document.getElementById("statsTitle").textContent = L.stats_title;

  document.getElementById("btnWeek").textContent = L.stats_week;
  document.getElementById("btnMonth").textContent = L.stats_month;

  document.getElementById("btnBar").textContent = L.stats_bar;
  document.getElementById("btnScatter").textContent = L.stats_scatter;

  document.getElementById("btnBack").textContent = L.back;
}

/* ============================
   返回首页
============================ */
document.getElementById("btnBack").onclick = () => {
  window.location.href = "index.html";
};

/* ============================
   计算卡路里
============================ */
function caloriesPerSet(reps) {
  return reps * 0.6;
}

function getDayStats(dateKey) {
  const items = history[dateKey];
  if (!items) return { totalReps: 0, totalCalories: 0 };

  let totalReps = 0;
  let totalCalories = 0;

  for (const item in items) {
    const sets = items[item];
    const reps = findReps(item);
    const cals = caloriesPerSet(reps);

    totalReps += reps * sets;
    totalCalories += cals * sets;
  }

  return { totalReps, totalCalories };
}

function findReps(itemName) {
  for (const part in WORKOUT_GROUPS) {
    for (const obj of WORKOUT_GROUPS[part]) {
      if (obj.name === itemName) return obj.reps;
    }
  }
  return 0;
}

/* ============================
   周/月偏移
============================ */
let weekOffset = 0;
let monthOffset = 0;

function getWeekByOffset(offset) {
  const today = new Date();
  today.setDate(today.getDate() + offset * 7);

  const day = today.getDay();
  const monday = new Date(today);

  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diff);

  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

function getMonthByOffset(offset) {
  const today = new Date();
  today.setMonth(today.getMonth() + offset);

  const year = today.getFullYear();
  const month = today.getMonth();

  const days = new Date(year, month + 1, 0).getDate();
  const arr = [];

  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

/* ============================
   柱状图（能量）
============================ */
function renderBar(dates) {
  const L = LANG[currentLang];

  const labels = dates.map(d => d.slice(5));
  const data = dates.map(d => getDayStats(d).totalCalories);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: L.stats_energy,
        data,
        backgroundColor: isDarkMode() ? "#4e8cff" : "#4f46e5"
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: L.stats_title,
          color: isDarkMode() ? "#fff" : "#000"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: isDarkMode() ? "#fff" : "#000" }
        },
        x: {
          ticks: { color: isDarkMode() ? "#fff" : "#000" }
        }
      }
    }
  });
}

/* ============================
   散点图（能量 + 部位）
============================ */
function renderScatter(dates) {
  const L = LANG[currentLang];
  const allRecords = [];

  dates.forEach(date => {
    const items = history[date];
    if (!items) return;

    for (const itemName in items) {
      const sets = items[itemName];
      const reps = findReps(itemName);
      const calories = caloriesPerSet(reps) * sets;

      let part = "other";
      for (const p in WORKOUT_GROUPS) {
        if (WORKOUT_GROUPS[p].some(obj => obj.name === itemName)) {
          part = p;
          break;
        }
      }

      allRecords.push({ part, calories, sets });
    }
  });

  if (chart) chart.destroy();

  if (allRecords.length === 0) {
    chart = new Chart(ctx, {
      type: "bubble",
      data: { datasets: [] }
    });
    return;
  }

  const parts = [...new Set(allRecords.map(r => r.part))];

  const colorMap = {
    "胸部": "255,99,132",
    "背部": "54,162,235",
    "腿部": "75,192,192",
    "肩部": "255,206,86",
    "手臂": "153,102,255",
    "核心": "255,159,64",
    "other": "120,120,120"
  };

  const datasets = {};

  allRecords.forEach(r => {
    const { part, calories, sets } = r;

    const intensity = calories / sets;
    const alpha = Math.min(1, Math.max(0.25, intensity / 50));

    if (!datasets[part]) {
      datasets[part] = {
        label: part,
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      };
    }

    datasets[part].data.push({
      x: part,
      y: calories,
      r: Math.sqrt(calories) * 2
    });

    datasets[part].backgroundColor.push(`rgba(${colorMap[part]},${alpha})`);
    datasets[part].borderColor.push(`rgba(${colorMap[part]},1)`);
  });

  chart = new Chart(ctx, {
    type: "bubble",
    data: { datasets: Object.values(datasets) },
    options: {
      plugins: {
        title: {
          display: true,
          text: L.stats_title,
          color: isDarkMode() ? "#fff" : "#000"
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const calories = context.raw.y;
              return `${L.stats_energy}: ${calories.toFixed(1)} kcal`;
            }
          }
        }
      },
      scales: {
        x: {
          type: "category",
          labels: parts,
          title: { display: true, text: L.stats_part },
          ticks: { color: isDarkMode() ? "#fff" : "#000" }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: L.stats_energy },
          ticks: { color: isDarkMode() ? "#fff" : "#000" }
        }
      }
    }
  });
}

/* ============================
   刷新图表
============================ */
let currentMode = "week";
let currentChart = "bar";

function refreshChart() {
  let dates;

  if (currentMode === "week") {
    dates = getWeekByOffset(weekOffset);
  } else {
    dates = getMonthByOffset(monthOffset);
  }

  if (currentChart === "bar") {
    renderBar(dates);
  } else {
    renderScatter(dates);
  }
}

/* ============================
   按钮绑定
============================ */
document.getElementById("btnWeek").onclick = () => {
  currentMode = "week";
  weekOffset = 0;
  refreshChart();
};

document.getElementById("btnMonth").onclick = () => {
  currentMode = "month";
  monthOffset = 0;
  refreshChart();
};

document.getElementById("btnBar").onclick = () => {
  currentChart = "bar";
  refreshChart();
};

document.getElementById("btnScatter").onclick = () => {
  currentChart = "scatter";
  refreshChart();
};

document.getElementById("btnPrev").onclick = () => {
  if (currentMode === "week") weekOffset--;
  else monthOffset--;
  refreshChart();
};

document.getElementById("btnNext").onclick = () => {
  if (currentMode === "week") weekOffset++;
  else monthOffset++;
  refreshChart();
};

/* ============================
   初始化
============================ */
applyLangStats();
refreshChart();
