// statistics.js
// =====================================
// 统计页（多语言 + 图表）
// =====================================

/* ============================
   DOM
============================ */
const btnWeek = document.getElementById("btnWeek");
const btnMonth = document.getElementById("btnMonth");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnBar = document.getElementById("btnBar");
const btnRadar = document.getElementById("btnRadar");
const btnBack = document.getElementById("btnBack");

const canvasBar = document.getElementById("barChart");
const canvasRadar = document.getElementById("radarChart");

let barChart = null;
let radarChart = null;

/* ============================
   状态：周/月偏移
============================ */
let currentMode = "week"; // "week" or "month"
let weekOffset = 0;
let monthOffset = 0;

/* ============================
   返回主页
============================ */
btnBack.onclick = () => {
  window.location.assign("index.html");
};

/* ============================
   获取某周的日期（Mon–Sun）
============================ */
function getWeekRange(offset) {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const monday = new Date(today);

  monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(formatLocal(d));
  }
  return days;
}

/* ============================
   获取某月的所有日期（从 1 号开始）
============================ */
function getMonthRange(offset) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + offset;

  const first = new Date(year, month, 1);
  const next = new Date(year, month + 1, 1);

  const days = [];
  for (let d = new Date(first); d < next; d.setDate(d.getDate() + 1)) {
    days.push(formatLocal(d));
  }
  return days;
}

/* ============================
   从日期列表中取数据
============================ */
function getDataForDates(dateList) {
  const result = {};
  dateList.forEach(d => {
    if (history[d]) result[d] = history[d];
  });
  return result;
}

/* ============================
   绘制柱状图（按周每日）
============================ */
function renderBarChart(data) {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyEnergy = [0, 0, 0, 0, 0, 0, 0];

  for (const date in data) {
    const d = new Date(date);
    let day = d.getDay(); // 0=Sun
    day = (day + 6) % 7;  // 转 Mon=0

    const items = data[date];
    let total = 0;

    for (const name in items) {
      const sets = items[name];
      const reps = findReps(name);
      total += sets * reps * 0.6;
    }

    dailyEnergy[day] += total;
  }

  if (barChart) barChart.destroy();

  barChart = new Chart(canvasBar.getContext("2d"), {
    type: "bar",
    data: {
      labels: weekDays,
      datasets: [{
        label: getChartTitle("bar"),
        data: dailyEnergy,
        backgroundColor: "#22c55e"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y.toFixed(1)} kcal`
          }
        }
      }
    }
  });
}

/* ============================
   绘制雷达图（六维能力）
============================ */
function renderRadarChart(data) {
  const FITNESS_DIMENSIONS = [
    "balance",
    "power",
    "endurance",
    "flexibility",
    "stability",
    "coordination"
  ];

  const dimEnergy = calcEnergyByDimension(data);

  const labels = FITNESS_DIMENSIONS.map(d => getLocalizedDimension(d));
  const values = FITNESS_DIMENSIONS.map(d => dimEnergy[d] || 0);

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(canvasRadar.getContext("2d"), {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: getChartTitle("radar"),
        data: values,
        backgroundColor: "rgba(34,197,94,0.3)",
        borderColor: "#22c55e",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          ticks: { display: false },
          suggestedMin: 0,
          suggestedMax: Math.max(...values, 10)
        }
      }
    }
  });
}

/* ============================
   按钮事件：周/月切换
============================ */
btnWeek.onclick = () => {
  currentMode = "week";
  weekOffset = 0;

  const dates = getWeekRange(weekOffset);
  const data = getDataForDates(dates);

  renderBarChart(data);
  renderRadarChart(data);
};

btnMonth.onclick = () => {
  currentMode = "month";
  monthOffset = 0;

  const dates = getMonthRange(monthOffset);
  const data = getDataForDates(dates);

  renderBarChart(data);
  renderRadarChart(data);
};

/* ============================
   上一周 / 下一周 / 上一月 / 下一月
============================ */
btnPrev.onclick = () => {
  if (currentMode === "week") {
    weekOffset--;
    const dates = getWeekRange(weekOffset);
    const data = getDataForDates(dates);
    renderBarChart(data);
    renderRadarChart(data);
  } else {
    monthOffset--;
    const dates = getMonthRange(monthOffset);
    const data = getDataForDates(dates);
    renderBarChart(data);
    renderRadarChart(data);
  }
};

btnNext.onclick = () => {
  if (currentMode === "week") {
    weekOffset++;
    const dates = getWeekRange(weekOffset);
    const data = getDataForDates(dates);
    renderBarChart(data);
    renderRadarChart(data);
  } else {
    monthOffset++;
    const dates = getMonthRange(monthOffset);
    const data = getDataForDates(dates);
    renderBarChart(data);
    renderRadarChart(data);
  }
};

/* ============================
   图表切换
============================ */
btnBar.onclick = () => {
  canvasBar.parentElement.style.display = "block";
  canvasRadar.parentElement.style.display = "none";
};

btnRadar.onclick = () => {
  canvasBar.parentElement.style.display = "none";
  canvasRadar.parentElement.style.display = "block";
};

/* ============================
   启动：默认显示本周
============================ */
document.addEventListener("DOMContentLoaded", () => {
  const dates = getWeekRange(0);
  const data = getDataForDates(dates);

  renderBarChart(data);
  renderRadarChart(data);

  canvasBar.parentElement.style.display = "block";
  canvasRadar.parentElement.style.display = "none";
});
