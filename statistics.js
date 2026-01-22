// statistics.js
// =====================================
// 统计页（多语言 + 图表）
// =====================================

/* ============================
   DOM
============================ */
const btnWeek = document.getElementById("btnWeek");
const btnMonth = document.getElementById("btnMonth");
const btnBar = document.getElementById("btnBar");
const btnRadar = document.getElementById("btnRadar");
const btnBack = document.getElementById("btnBack");

const canvasBar = document.getElementById("barChart");
const canvasRadar = document.getElementById("radarChart");

let barChart = null;
let radarChart = null;

/* ============================
   返回主页
============================ */
btnBack.onclick = () => {
  window.location.assign("index.html");
};

/* ============================
   绘制柱状图（按周每日）
============================ */
function renderBarChart(data) {
  // 固定从周一开始
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyEnergy = [0, 0, 0, 0, 0, 0, 0];

  for (const date in data) {
    const d = new Date(date);
    let day = d.getDay(); // 0=Sun, 1=Mon...

    // 转换成 Mon=0 ... Sun=6
    day = (day + 6) % 7;

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
   按钮事件
============================ */
btnWeek.onclick = () => {
  const data = getRecentDays(7);
  renderBarChart(data);
  renderRadarChart(data);
};

btnMonth.onclick = () => {
  const data = getRecentDays(30);
  renderBarChart(data);
  renderRadarChart(data);
};

btnBar.onclick = () => {
  canvasBar.parentElement.style.display = "block";
  canvasRadar.parentElement.style.display = "none";
};

btnRadar.onclick = () => {
  canvasBar.parentElement.style.display = "none";
  canvasRadar.parentElement.style.display = "block";
};

/* ============================
   启动：默认显示最近 7 天
============================ */
document.addEventListener("DOMContentLoaded", () => {
  const data = getRecentDays(7);
  renderBarChart(data);
  renderRadarChart(data);

  canvasBar.parentElement.style.display = "block";
  canvasRadar.parentElement.style.display = "none";
});
