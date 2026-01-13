let chart;
let radarChart = null;
let lastPartEnergy = null;

const chartCanvas = document.getElementById("chartCanvas");
const ctx = chartCanvas.getContext("2d");

const bodyMainContainer = document.getElementById("bodyMainContainer");
const bodyCanvas = document.getElementById("bodyHeatCanvas");
const bodyCtx = bodyCanvas.getContext("2d");
const bodyTooltip = document.getElementById("bodyTooltip");

const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

// 身体部位坐标（基于 266×400 虚线人体图）
const BODY_PART_MAP = {
  // 左侧：正面视图
  "头部":   { x: 66,  y: 40,  r: 28 },
  "肩部":   { x: 66,  y: 85,  r: 24 },
  "胸部":   { x: 66,  y: 120, r: 26 },
  "核心":   { x: 66,  y: 165, r: 22 },
  "手臂":   { x: 36,  y: 150, r: 20 },
  "腿部":   { x: 66,  y: 270, r: 32 },

  // 右侧：背面视图
  "背部":   { x: 200, y: 120, r: 26 },
  "臀部":   { x: 200, y: 180, r: 24 },
  "腿后侧": { x: 200, y: 270, r: 32 }
};

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

/* -----------------------------
   根据日期集合计算各部位能量
----------------------------- */
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

/* -----------------------------
   根据各部位能量计算雷达图六维数据
----------------------------- */
function computeRadarValues(partEnergy) {
  const chest = partEnergy["胸部"];
  const back = partEnergy["背部"];
  const legs = partEnergy["腿部"];
  const shoulder = partEnergy["肩部"];
  const arm = partEnergy["手臂"];
  const core = partEnergy["核心"];

  return [
    chest + back + legs,
    shoulder + arm,
    core,
    core + legs,
    shoulder + core,
    chest + back + legs + shoulder + arm + core
  ];
}

/* -----------------------------
   柱状图（能量消耗）
----------------------------- */
function renderBar(dates) {
  chartCanvas.style.display = "block";
  bodyMainContainer.style.display = "none";

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

/* -----------------------------
   人体热点图渲染（高斯模糊）
----------------------------- */
function renderBodyHeatmap(partEnergy) {
  bodyCtx.clearRect(0, 0, bodyCanvas.width, bodyCanvas.height);

  bodyCtx.filter = "blur(18px)";

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

    bodyCtx.beginPath();
    bodyCtx.fillStyle = color;
    bodyCtx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
    bodyCtx.fill();
  }

  bodyCtx.filter = "none";
}

/* -----------------------------
   热点图模式
----------------------------- */
function renderHeatmap(dates) {
  const partEnergy = computePartEnergy(dates);
  lastPartEnergy = partEnergy;

  if (chart) {
    chart.destroy();
    chart = null;
  }

  chartCanvas.style.display = "none";
  bodyMainContainer.style.display = "block";

  renderBodyHeatmap(partEnergy);
  renderRadar(computeRadarValues(partEnergy));
}

/* -----------------------------
   雷达图渲染
----------------------------- */
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

/* -----------------------------
   点击人体显示 tooltip（不弹窗）
----------------------------- */
function bindBodyClick() {
  bodyCanvas.addEventListener("click", function (e) {
    if (!lastPartEnergy) return;

    const rect = bodyCanvas.getBoundingClientRect();
    const scaleX = bodyCanvas.width / rect.width;
    const scaleY = bodyCanvas.height / rect.height;

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

      const containerRect = bodyMainContainer.getBoundingClientRect();
      const relX = e.clientX - containerRect.left;
      const relY = e.clientY - containerRect.top;

      bodyTooltip.style.left = `${relX + 8}px`;
      bodyTooltip.style.top = `${relY + 8}px`;
      bodyTooltip.innerText = `${nearestPart}: ${energy.toFixed(1)} kcal`;
      bodyTooltip.style.display = "block";
    } else {
      bodyTooltip.style.display = "none";
    }
  });

  bodyCanvas.addEventListener("mouseleave", () => {
    bodyTooltip.style.display = "none";
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

// 初始化
bindBodyClick();
refreshChart();
