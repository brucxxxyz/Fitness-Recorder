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
// 柱状图（能量消耗）
function renderBar(dates) {
  const labels = dates.map(d => d.slice(5)); // 显示 MM-DD
  const data = dates.map(d => getDayStats(d).totalCalories); // ← 改成卡路里

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "能量消耗（kcal）",   // ← 修改标题
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

// 散点图（自动修复版：自动部位、自动分类、自动能量、自动强度）
function renderScatter(dates) {

  // 1. 自动收集所有训练记录
  const allRecords = [];

  dates.forEach(date => {
    const items = history[date];
    if (!items) return;

    for (const itemName in items) {
      const sets = items[itemName];
      const reps = findReps(itemName);
      const calories = caloriesPerSet(reps) * sets;

      // 自动识别训练部位
      let part = "other";
      for (const p in WORKOUT_GROUPS) {
        if (WORKOUT_GROUPS[p].some(obj => obj.name === itemName)) {
          part = p;
          break;
        }
      }

      allRecords.push({
        part,
        calories,
        sets,
        reps
      });
    }
  });

  // 2. 如果没有任何数据 → 显示空图
  if (allRecords.length === 0) {
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "bubble",
      data: { datasets: [] },
      options: {
        scales: {
          x: { type: "category", labels: [] },
          y: { beginAtZero: true }
        }
      }
    });
    return;
  }

  // 3. 自动生成 X 轴分类（按实际出现的部位）
  const parts = [...new Set(allRecords.map(r => r.part))];

  // 4. 自动生成颜色（RGB）
  const colorMap = {
    chest:   "255,99,132",
    back:    "54,162,235",
    legs:    "75,192,192",
    shoulder:"255,206,86",
    arms:    "153,102,255",
    core:    "255,159,64",
    other:   "120,120,120"
  };

  // 5. 自动按部位分组
  const datasets = {};

  allRecords.forEach(r => {
    const { part, calories, sets } = r;

    // 强度 = 能量 / 组数
    const intensity = calories / sets;
    const alpha = Math.min(1, Math.max(0.25, intensity / 50));

    if (!datasets[part]) {
      datasets[part] = {
        label: part,
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      };
    }

    datasets[part].data.push({
      x: part,
      y: calories,
      r: Math.sqrt(calories) * 2
    });

    datasets[part].backgroundColor.push(`rgba(${colorMap[part] || colorMap.other},${alpha})`);
    datasets[part].borderColor.push(`rgba(${colorMap[part] || colorMap.other},1)`);
  });

  // 6. 渲染图表
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: Object.values(datasets)
    },
    options: {
      scales: {
        x: {
          type: "category",
          labels: parts,
          title: { display: true, text: "训练部位" }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "能量消耗 (kcal)" }
        }
      }
    }
  });
}


  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: Object.values(datasets)
    },
    options: {
      scales: {
        x: {
          type: "category",
          labels: ["chest","back","legs","shoulder","arms","core","other"],
          title: { display: true, text: "训练部位" }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "能量消耗 (kcal)" }
        }
      }
    }
  });
}

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: Object.values(datasets)
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
