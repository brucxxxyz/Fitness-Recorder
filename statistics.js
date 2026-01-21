// statistics.js
// =====================================
// 统计页（多语言 + 图表）
// 依赖：workouts.js + app.i18n.js
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
if (btnBack) {
  btnBack.onclick = () => {
    window.location.assign("index.html");
  };
}

/* ============================
   获取最近 N 天的数据
============================ */
function getRecentDays(n) {
  const result = {};
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const key = d.toISOString().slice(0, 10);
    if (history[key]) result[key] = history[key];
  }

  return result;
}

/* ============================
   计算能量（按部位）
============================ */
function calcEnergyByPart(data) {
  const partEnergy = {};

  for (const date in data) {
    const items = data[date];

    for (const name in items) {
      const sets = items[name];
      const reps = findReps(name);
      const energy = sets * reps * 0.6;

      // 找到动作属于哪个部位
      let part = null;
      for (const p in WORKOUT_GROUPS) {
        if (WORKOUT_GROUPS[p].some(x => x.name === name)) {
          part = p;
          break;
        }
      }

      if (!part) continue;

      if (!partEnergy[part]) partEnergy[part] = 0;
      partEnergy[part] += energy;
    }
  }

  return partEnergy;
}

/* ============================
   绘制柱状图（能量）
============================ */
function renderBarChart(data) {
  const partEnergy = calcEnergyByPart(data);

  const labels = Object.keys(partEnergy).map(p => getLocalizedPart(p));
  const values = Object.values(partEnergy);

  if (barChart) barChart.destroy();

  barChart = new Chart(canvasBar, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: getChartTitle("bar"),
        data: values,
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
   绘制雷达图（六维）
============================ */
function renderRadarChart(data) {
  const partEnergy = calcEnergyByPart(data);

  const labels = Object.keys(partEnergy).map(p => getLocalizedPart(p));
  const values = Object.values(partEnergy);

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(canvasRadar, {
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
          ticks: { display: false }
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
  canvasBar.style.display = "block";
  canvasRadar.style.display = "none";
};

btnRadar.onclick = () => {
  canvasBar.style.display = "none";
  canvasRadar.style.display = "block";
};

/* ============================
   启动：默认显示最近 7 天
============================ */
document.addEventListener("DOMContentLoaded", () => {
  const data = getRecentDays(7);
  renderBarChart(data);
  renderRadarChart(data);

  canvasBar.style.display = "block";
  canvasRadar.style.display = "none";
});
