let chart;
let radarChart = null;

const ctx = document.getElementById("chartCanvas").getContext("2d");
const radarCtx = document.getElementById("radarCanvas").getContext("2d");

const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

// 当前选中的日期（用于雷达图联动）
let selectedDate = null;

// 图表显示开关（默认两个都显示）
let showBar = true;
let showRadar = true;

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
   计算各部位能量
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
   计算雷达图六维指标
----------------------------- */
function computeRadarValues(partEnergy) {
  const chest = partEnergy["胸部"];
  const back = partEnergy["背部"];
  const legs = partEnergy["腿部"];
  const shoulder = partEnergy["肩部"];
  const arm = partEnergy["手臂"];
  const core = partEnergy["核心"];

  return [
    chest + back + legs,                     // 力量
    shoulder + arm,                          // 爆发
    core,                                    // 核心
    core + legs,                             // 平衡
    shoulder + core,                         // 灵活
    chest + back + legs + shoulder + arm + core // 耐力
  ];
}

/* -----------------------------
   柱状图（能量消耗）
----------------------------- */
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
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const date = dates[index];

          selectedDate = (selectedDate === date) ? null : date;
          updateRadar();
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/* -----------------------------
   雷达图
----------------------------- */
function renderRadar(values) {
  const labels = ["力量", "爆发", "核心", "平衡", "灵活", "耐力"];

  if (!radarChart) {
    radarChart = new Chart(radarCtx, {
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
        animation: {
          duration: 900,
          easing: "easeOutQuart"
        },
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
  } else {
    radarChart.data.datasets[0].data = values;
    radarChart.update({
      duration: 900,
      easing: "easeOutQuart"
    });
  }
}

/* -----------------------------
   雷达图联动逻辑
----------------------------- */
function updateRadar() {
  let dates;

  if (selectedDate) {
    dates = [selectedDate]; // 单日
  } else {
    dates = currentMode === "week"
      ? getWeekByOffset(weekOffset)
      : getMonthByOffset(monthOffset);
  }

  const partEnergy = computePartEnergy(dates);
  const radarValues = computeRadarValues(partEnergy);

  renderRadar(radarValues);
}

/* -----------------------------
   刷新图表（支持同时显示）
----------------------------- */
let currentMode = "week";

function refreshChart() {
  selectedDate = null; // 切换周/月时清除选中

  let dates = currentMode === "week"
    ? getWeekByOffset(weekOffset)
    : getMonthByOffset(monthOffset);

  // 柱状图
  if (showBar) {
    document.getElementById("chartCanvas").style.display = "block";
    renderBar(dates);
  } else {
    document.getElementById("chartCanvas").style.display = "none";
  }

  // 雷达图
  if (showRadar) {
    document.getElementById("radarCanvas").style.display = "block";
    updateRadar();
  } else {
    document.getElementById("radarCanvas").style.display = "none";
  }
}

/* -----------------------------
   按钮绑定（开关模式）
----------------------------- */
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
  showBar = !showBar;
  refreshChart();
};

document.getElementById("btnRadar").onclick = () => {
  showRadar = !showRadar;
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
