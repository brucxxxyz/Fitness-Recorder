// statistics.js

let chart;
const ctx = document.getElementById("chartCanvas").getContext("2d");

const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

// 自动根据 reps 推算卡路里
function caloriesPerSet(reps) {
  return reps * 0.6;
}

// 获取某天总次数 & 总卡路里
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

// 获取最近 7 天
function getLast7Days() {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    arr.push(key);
  }
  return arr;
}

// 获取最近 30 天
function getLast30Days() {
  const arr = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    arr.push(key);
  }
  return arr;
}

// 渲染柱状图（数量）
function renderBar(dates) {
  const labels = dates.map(d => d.slice(5));
  const data = dates.map(d => getDayStats(d).totalReps);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "总次数",
        data,
        backgroundColor: "#4f46e5"
      }]
    }
  });
}

// 渲染散点图（卡路里 + 次数）
function renderScatter(dates) {
  const data = dates.map(d => {
    const { totalReps, totalCalories } = getDayStats(d);
    return {
      x: d.slice(5),
      y: totalCalories,
      r: Math.max(3, totalReps / 20) // 点大小
    };
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: [{
        label: "卡路里（点大小代表次数）",
        data,
        backgroundColor: "rgba(59,130,246,0.6)"
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// 默认：每周柱状图
let currentMode = "week";
let currentChart = "bar";

function refreshChart() {
  const dates = currentMode === "week" ? getLast7Days() : getLast30Days();
  if (currentChart === "bar") renderBar(dates);
  else renderScatter(dates);
}

// 按钮绑定
document.getElementById("btnWeek").onclick = () => {
  currentMode = "week";
  refreshChart();
};

document.getElementById("btnMonth").onclick = () => {
  currentMode = "month";
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

// 初始化
refreshChart();
