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
  const today = new Date();
  today.setDate(today.getDate() + offset * 7);

  const day = today.getDay(); // 0=周日,1=周一
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

// 柱状图（数量）
function renderBar(dates) {
  const labels = dates.map(d => d.slice(5)); // 显示 MM-DD
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
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// 散点图（卡路里 + 次数大小）
function renderScatter(dates) {
  const data = dates.map(d => {
    const { totalReps, totalCalories } = getDayStats(d);
    return {
      x: d.slice(5),
      y: totalCalories,
      r: Math.max(3, totalReps / 20) // 点越大次数越多
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

// 当前模式：week / month，bar / scatter
let currentMode = "week";   // 默认本周
let currentChart = "bar";   // 默认柱状图

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

// 绑定按钮
document.getElementById("btnWeek").onclick = () => {
  currentMode = "week";
  weekOffset = 0;     // 回到本周
  refreshChart();
};

document.getElementById("btnMonth").onclick = () => {
  currentMode = "month";
  monthOffset = 0;    // 回到本月
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
  if (currentMode === "week") {
    weekOffset--;
  } else {
    monthOffset--;
  }
  refreshChart();
};

document.getElementById("btnNext").onclick = () => {
  if (currentMode === "week") {
    weekOffset++;
  } else {
    monthOffset++;
  }
  refreshChart();
};

document.getElementById("btnBack").onclick = () => {
  window.location.href = "index.html";
};

// 默认本周 / 本月（currentMode="week" 时显示本周）
refreshChart();
