let chart;
const ctx = document.getElementById("chartCanvas").getContext("2d");

const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

function caloriesPerSet(reps) {
  return reps * 0.6;
}

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

function getLast7Days() {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

function getLast30Days() {
  const arr = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

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

function renderScatter(dates) {
  const data = dates.map(d => {
    const { totalReps, totalCalories } = getDayStats(d);
    return {
      x: d.slice(5),
      y: totalCalories,
      r: Math.max(3, totalReps / 20)
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

let currentMode = "week";
let currentChart = "bar";

function refreshChart() {
  const dates = currentMode === "week" ? getLast7Days() : getLast30Days();
  if (currentChart === "bar") renderBar(dates);
  else renderScatter(dates);
}

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

document.getElementById("btnBack").onclick = () => {
  window.location.href = "index.html";
};

refreshChart();
