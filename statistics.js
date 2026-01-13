let chart;
let radarChart = null;
let lastPartEnergy = null;

const ctx = document.getElementById("chartCanvas").getContext("2d");

const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

// ===============================
// 1. 身体部位坐标（基于新版 160×400 虚线人体图）
// ===============================
const BODY_PART_MAP = {
  "胸部": { x: 80, y: 120, r: 38 },
  "背部": { x: 80, y: 120, r: 38 },
  "核心": { x: 80, y: 165, r: 32 },
  "肩部": { x: 80, y: 85, r: 28 },
  "手臂": { x: 40, y: 150, r: 26 },
  "腿部": { x: 80, y: 260, r: 45 }
};

// ===============================
// 2. 自动卡路里：B 方案
// ===============================
function caloriesPerSet(reps) {
  return reps * 0.6;
}

// ===============================
// 3. 计算某天总次数 & 总卡路里
// ===============================
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

// ===============================
// 4. 周/月偏移
// ===============================
let weekOffset = 0;
let monthOffset = 0;

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

// ===============================
// 5. 计算各部位能量
// ===============================
function computePartEnergy(dates) {
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

  return partEnergy;
}

// ===============================
// 6. 雷达图六维数据
// ===============================
function computeRadarValues(partEnergy) {
  const chest = partEnergy["胸部"];
  const back = partEnergy["背部"];
  const legs = partEnergy["腿部"];
  const shoulder = partEnergy["肩部"];
  const arm = partEnergy["手臂"];
  const core = partEnergy["核心"];

  return [
    chest + back + legs,                                 // 肌肉力量
    shoulder + arm,                                      // 爆发力
    core,                                                // 冲衝
    core + legs,                                         // 平衡性
    shoulder + core,                                     // 灵活性
    chest + back + legs + shoulder + arm + core          // 耐力
  ];
}

// ===============================
// 7. 柱状图
// ===============================
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
      scales: { y: { beginAtZero: true } }
    }
  });

  const partEnergy = computePartEnergy(dates);
  lastPartEnergy = partEnergy;
  renderBodyHeatmap(partEnergy);
  renderRadar(computeRadarValues(partEnergy));
}

// ===============================
// 8. 人体热力图（高斯模糊）
// ===============================
function renderBodyHeatmap(partEnergy) {
  const canvas = document.getElementById("bodyHeatCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = "blur(18px)";

  function energyToColor(value) {
    if (value <= 0) return "rgba(0,0,255,0.25)";
    if (value < 50) return "rgba(0,150,255,0.35)";
    if (value < 120) return "rgba(255,200,0,0.45)";
    if (value < 200) return "rgba(255,100,0,0.55)";
    return "rgba(255,255,255,0.75)";
  }

  for (const part in partEnergy) {
    const energy = partEnergy[part];
    const color = energyToColor(energy);
    const pos = BODY_PART_MAP[part];
    if (!pos) continue;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.filter = "none";
}

// ===============================
// 9. 热点图模式
// ===============================
function renderHeatmap(dates) {
  const partEnergy = computePartEnergy(dates);
  lastPartEnergy = partEnergy;

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: { labels: [], datasets: [] },
    options: { plugins: { legend: { display: false } } }
  });

  renderBodyHeatmap(partEnergy);
  renderRadar(computeRadarValues(partEnergy));
}

// ===============================
// 10. 雷达图
// ===============================
function renderRadar(values) {
  const ctxRadar = document.getElementById("radarCanvas").getContext("2d");
  const labels = ["肌肉力量", "爆发力", "冲衝", "平衡性", "灵活性", "耐力"];

  if (!radarChart) {
    radarChart = new Chart(ctxRadar, {
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
        animation: { duration: 600, easing: "easeOutQuad" },
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
  } else {
    radarChart.data.datasets[0].data = values;
    radarChart.update({ duration: 600, easing: "easeOutQuad" });
  }
}

// ===============================
// 11. 点击人体显示能量
// ===============================
function bindBodyClick() {
  const canvas = document.getElementById("bodyHeatCanvas");

  canvas.addEventListener("click", function (e) {
    if (!lastPartEnergy) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    let nearestPart = null;
    let nearestDist = Infinity;

    for (const part in BODY_PART_MAP) {
      const pos = BODY_PART_MAP[part];
      const dx = x - pos.x;
      const dy = y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < pos.r * 1.2 && dist < nearestDist) {
        nearestDist = dist;
        nearestPart = part;
      }
    }

    if (nearestPart) {
      const energy = lastPartEnergy[nearestPart] || 0;
      alert(`${nearestPart}\n能量消耗：${energy.toFixed(1)} kcal`);
    }
  });
}

// ===============================
// 12. 模式切换
// ===============================
let currentMode = "week";
let currentChart = "bar";

function refreshChart() {
  let dates;

  if (currentMode === "week") dates = getWeekByOffset(weekOffset);
  else dates = getMonthByOffset(monthOffset);

  if (currentChart === "bar") renderBar(dates);
  else renderHeatmap(dates);
}

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

// ===============================
// 13. 初始化
// ===============================
bindBodyClick();
refreshChart();
