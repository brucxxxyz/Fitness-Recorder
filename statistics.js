let chart;
const ctx = document.getElementById("chartCanvas").getContext("2d");

const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

// 自动卡路里：B 方案
function caloriesPerSet(reps) {
  return reps * 0.6;
}

// 计算某天总次数 & 总卡路里
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

// 偏移量：0=本周/本月，-1=上周/上月，+1=下周/下月
let weekOffset = 0;
let monthOffset = 0;

// 根据偏移获取一周（周一~周日）
function getWeekByOffset(offset) {
  const base = new Date();
  base.setDate(base.getDate() + offset * 7);

  let day = base.getDay();
  if (day === 0) day = 7;

  const monday = new Date(base);
  monday.setDate(base.getDate() - (day - 1));

  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

// 根据偏移获取一个月所有日期
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

// 柱状图（能量消耗）
function renderBar(dates) {
  const labels = dates.map(d => d.slice(5));
  const data = dates.map(d => getDayStats(d).totalCalories);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "能量消耗（kcal）",
        data,
        backgroundColor: "#4f46e5"
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/* -----------------------------
   人体热点图渲染（Canvas）
----------------------------- */
function renderBodyHeatmap(partEnergy) {
  const canvas = document.getElementById("bodyHeatCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 颜色映射（蓝→黄→红→白）
  function energyToColor(value) {
    if (value <= 0) return "rgba(0,0,255,0.25)";
    if (value < 50) return "rgba(0,150,255,0.35)";
    if (value < 120) return "rgba(255,200,0,0.45)";
    if (value < 200) return "rgba(255,100,0,0.55)";
    return "rgba(255,255,255,0.75)";
  }

  // 身体部位坐标（基于 wireframeBody.png）
  const map = {
    "胸部": { x: 80, y: 110, r: 40 },
    "背部": { x: 80, y: 140, r: 40 },
    "核心": { x: 80, y: 180, r: 35 },
    "肩部": { x: 80, y: 70, r: 30 },
    "手臂": { x: 40, y: 150, r: 25 },
    "腿部": { x: 80, y: 260, r: 45 }
  };

  // 绘制热点
  for (const part in partEnergy) {
    const energy = partEnergy[part];
    const color = energyToColor(energy);
    const pos = map[part];

    if (!pos) continue;

    const gradient = ctx.createRadialGradient(
      pos.x, pos.y, 5,
      pos.x, pos.y, pos.r
    );

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* -----------------------------
   热点图（替换散点图）
----------------------------- */
function renderHeatmap(dates) {
  const partEnergy = {
    "胸部": 0,
    "背部": 0,
    "腿部": 0,
    "肩部": 0,
    "手臂": 0,
    "核心": 0
  };

  dates.forEach(date => {
    const items = history[date];
    if (!items) return;

    for (const itemName in items) {
      const sets = items[itemName];
      const reps = findReps(itemName);
      const calories = caloriesPerSet(reps) * sets;

      for (const part in WORKOUT_GROUPS) {
        if (WORKOUT_GROUPS[part].some(obj => obj.name === itemName)) {
          partEnergy[part] += calories;
        }
      }
    }
  });

  // 清空 Chart.js 区域
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: { labels: [], datasets: [] },
    options: { plugins: { legend: { display: false } } }
  });

  // 渲染人体热点图
  renderBodyHeatmap(partEnergy);
}

/* -----------------------------
   雷达图渲染
----------------------------- */
function renderRadar() {
  const ctxRadar = document.getElementById("radarCanvas").getContext("2d");

  const labels = ["肌肉力量", "爆发力", "冲衝", "平衡性", "灵活性", "耐力"];

  // 未来可改为动态计算
  const values = [80, 65, 70, 60, 75, 85];

  new Chart(ctxRadar, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: "rgba(59,130,246,0.25)",
        borderColor: "rgba(59,130,246,1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(59,130,246,1)"
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        r: {
          beginAtZero: true,
          grid: { color: "#ccc" },
          angleLines: { color: "#ccc" },
          pointLabels: { font: { size: 12 } }
        }
      }
    }
  });
}

// 当前模式：week / month，bar / heatmap
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
  } else if (currentChart === "heatmap") {
    renderHeatmap(dates);
  }

  renderRadar();
}

// 绑定按钮
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

document.getElementById("btnHeatmap").onclick = () => {
  currentChart = "heatmap";
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

document.getElementById("btnBack").onclick = () => {
  window.location.href = "index.html";
};

// 默认显示本周
refreshChart();
