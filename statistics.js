/* ============================
   全局历史数据（必须放最顶部）
============================ */
let history = JSON.parse(localStorage.getItem("fitness_history") || "{}");

/* ============================
   全局变量
============================ */
let currentMode = "week";   // week / month
let currentChart = "bar";   // bar / radar

let barChart = null;
let radarChart = null;

/* ============================
   获取当前周或月的日期范围
============================ */
function getDateRange(mode) {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);

  if (mode === "week") {
    const day = today.getDay() || 7;
    start.setDate(today.getDate() - day + 1);
    end.setDate(start.getDate() + 6);
  } else {
    start.setDate(1);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
  }

  return { start, end };
}

/* ============================
   获取范围内的训练数据
============================ */
function getRangeData(mode) {
  const { start, end } = getDateRange(mode);
  const result = {};

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    if (history[key]) result[key] = history[key];
  }

  return result;
}

/* ============================
   计算柱状图数据（能量）
============================ */
function computeBarData(mode) {
  const rangeData = getRangeData(mode);
  const labels = [];
  const values = [];

  for (const date in rangeData) {
    let total = 0;
    const items = rangeData[date];

    for (const name in items) {
      const sets = items[name];
      const reps = findReps(name);
      total += sets * reps * 0.6;
    }

    labels.push(date.slice(5));
    values.push(total.toFixed(1));
  }

  return { labels, values };
}

/* ============================
   计算雷达图数据（六维能力）
============================ */
function computeRadarData(mode) {
  const rangeData = getRangeData(mode);

  const dims = {
    balance: 0,
    power: 0,
    endurance: 0,
    flexibility: 0,
    stability: 0,
    coordination: 0
  };

  for (const date in rangeData) {
    const items = rangeData[date];

    for (const name in items) {
      const sets = items[name];
      const reps = findReps(name);
      const score = sets * reps;

      const dim = WORKOUT_DIMENSION[name];
      if (dim) dims[dim] += score;
    }
  }

  return dims;
}

/* ============================
   绘制柱状图
============================ */
function renderBarChart() {
  const ctx = document.getElementById("barChart");
  if (!ctx) return;

  const { labels, values } = computeBarData(currentMode);

  if (barChart) barChart.destroy();

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: getChartTitle("bar"),
        data: values,
        backgroundColor: "rgba(34,197,94,0.6)",
        borderColor: "rgba(34,197,94,1)",
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/* ============================
   绘制雷达图
============================ */
function renderRadarChart() {
  const ctx = document.getElementById("radarChart");
  if (!ctx) return;

  const dims = computeRadarData(currentMode);

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(dims).map(k => getLocalizedDimension(k)),
      datasets: [{
        label: getChartTitle("radar"),
        data: Object.values(dims),
        backgroundColor: "rgba(34,197,94,0.3)",
        borderColor: "rgba(34,197,94,1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(34,197,94,1)"
      }]
    },
    options: {
      scales: {
        r: {
          beginAtZero: true,
          ticks: { display: false }
        }
      }
    }
  });
}

/* ============================
   刷新图表
============================ */
function refreshCharts() {
  if (currentChart === "bar") {
    renderBarChart();
  } else {
    renderRadarChart();
  }
}

/* ============================
   按钮绑定
============================ */
const btnWeek = document.getElementById("btnWeek");
const btnMonth = document.getElementById("btnMonth");
const btnBar = document.getElementById("btnBar");
const btnRadar = document.getElementById("btnRadar");
const btnBack = document.getElementById("btnBack");

if (btnWeek) btnWeek.addEventListener("click", () => {
  currentMode = "week";
  refreshCharts();
});

if (btnMonth) btnMonth.addEventListener("click", () => {
  currentMode = "month";
  refreshCharts();
});

if (btnBar) btnBar.addEventListener("click", () => {
  currentChart = "bar";
  refreshCharts();
});

if (btnRadar) btnRadar.addEventListener("click", () => {
  currentChart = "radar";
  refreshCharts();
});

if (btnBack) btnBack.addEventListener("click", () => {
  window.location.href = "index.html";
});

/* ============================
   初始化
============================ */
document.addEventListener("DOMContentLoaded", () => {
  refreshCharts();
});
