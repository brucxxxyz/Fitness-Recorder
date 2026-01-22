// app.core.js
// =====================================
// 健身核心逻辑（不含语言 & 主题）
// 依赖：workouts.js（WORKOUT_GROUPS）
// 语言 & 主题在 app.i18n.js / app.theme.js 中处理
// =====================================

/* ============================
   本地存储
============================ */
const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/* ============================
   本地日期函数（避免 NZ 时区倒退一天）
============================ */
function todayLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ============================
   初始化日期 = 今天（仅软件启动时）
============================ */
const datePicker = document.getElementById("datePicker");
if (datePicker) {
  datePicker.value = todayLocal();
}

/* ============================
   左右按钮切换日期
============================ */
const prevDateBtn = document.getElementById("prevDate");
const nextDateBtn = document.getElementById("nextDate");

if (prevDateBtn && nextDateBtn && datePicker) {
  prevDateBtn.onclick = () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() - 1);
    datePicker.value = formatLocal(d);
    datePicker.onchange && datePicker.onchange();
  };

  nextDateBtn.onclick = () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() + 1);
    datePicker.value = formatLocal(d);
    datePicker.onchange && datePicker.onchange();
  };
}

/* ============================
   填充部位下拉菜单
============================ */
const bodyPartSelect = document.getElementById("bodyPartSelect");

if (bodyPartSelect) {
  for (const part in WORKOUT_GROUPS) {
    const opt = document.createElement("option");
    opt.value = part;
    opt.textContent = part; // 语言层会覆盖
    bodyPartSelect.appendChild(opt);
  }
}

/* ============================
   今日训练渲染
============================ */
function renderSubItems() {
  if (!bodyPartSelect || !datePicker) return;

  const part = bodyPartSelect.value;
  const container = document.getElementById("subItemContainer");
  if (!container) return;

  container.innerHTML = "";

  const date = datePicker.value;
  const todayData = history[date] || {};

  (WORKOUT_GROUPS[part] || []).forEach((item) => {
    const row = document.createElement("div");
    row.className = "subitem-row";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.name;

    const repsLabel = document.createElement("span");
    repsLabel.className = "reps-label";
    repsLabel.textContent = `${item.reps} 次/组`;

    const total = document.createElement("span");
    total.className = "total-reps";

    const minus = document.createElement("button");
    minus.className = "counter-btn";
    minus.textContent = "-";

    const count = document.createElement("span");
    count.className = "count-number";

    const plus = document.createElement("button");
    plus.className = "counter-btn";
    plus.textContent = "+";

    let sets = todayData[item.name] || 0;
    count.textContent = sets;
    total.textContent = `${sets * item.reps} 次`;

    minus.onclick = () => {
      if (sets > 0) sets--;
      autoSave();
    };

    plus.onclick = () => {
      sets++;
      autoSave();
    };

    function autoSave() {
      const date = datePicker.value;
      if (!history[date]) history[date] = {};

      if (sets > 0) history[date][item.name] = sets;
      else delete history[date][item.name];

      saveHistory();
      updateRow();
      updateFooter();
    }

    function updateRow() {
      count.textContent = sets;
      total.textContent = `${sets * item.reps} 次`;
    }

    row.appendChild(name);
    row.appendChild(repsLabel);
    row.appendChild(total);
    row.appendChild(minus);
    row.appendChild(count);
    row.appendChild(plus);

    container.appendChild(row);
  });

  updateFooter();
}

/* ============================
   今日统计
============================ */
function updateFooter() {
  if (!datePicker) return;

  const date = datePicker.value;
  const todayData = history[date] || {};

  let totalSets = 0;
  let totalReps = 0;
  let totalCalories = 0;

  for (const name in todayData) {
    const sets = todayData[name];
    const reps = findReps(name);

    totalSets += sets;
    totalReps += sets * reps;
    totalCalories += sets * reps * 0.6;
  }

  renderFooter(totalSets, totalReps, totalCalories);
}

function renderFooter(totalSets, totalReps, totalCalories) {
  const box = document.getElementById("todaySummary");
  if (!box) return;

  // 使用当前语言的 summary 文案
  box.innerHTML = UI_TEXT[currentLang].summary(totalSets, totalReps, totalCalories);
}

/* ============================
   切换部位
============================ */
if (bodyPartSelect) {
  bodyPartSelect.onchange = () => {
    renderSubItems();
  };
}

/* ============================
   切换日期
============================ */
if (datePicker) {
  datePicker.onchange = () => {
    renderSubItems();
  };
}

/* ============================
   初次渲染
============================ */
renderSubItems();

/* ============================
   历史记录页
============================ */
const gotoHistoryBtn = document.getElementById("gotoHistory");

if (gotoHistoryBtn) {
  gotoHistoryBtn.onclick = () => {
    showHistoryPage();
  };
}

function showHistoryPage() {
  const homePage = document.getElementById("page-home");
  const historyPage = document.getElementById("page-history");
  const list = document.getElementById("historyList");

  if (!homePage || !historyPage || !list) return;

  homePage.classList.remove("active");
  historyPage.classList.add("active");

  list.innerHTML = "";

  const dates = Object.keys(history)
    .filter(d => Object.keys(history[d]).length > 0)
    .sort()
    .reverse();

  dates.forEach(date => {
    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = date;
    list.appendChild(title);

    const items = history[date];

    for (const name in items) {
      const reps = findReps(name);

      const row = document.createElement("div");
      row.className = "subitem-row";

      const left = document.createElement("span");
      left.className = "item-name";
      left.textContent = name;

      const repsLabel = document.createElement("span");
      repsLabel.className = "reps-label";
      repsLabel.textContent = `${reps} 次/组`;

      const totalLabel = document.createElement("span");
      totalLabel.className = "total-reps";
      totalLabel.textContent = `${items[name] * reps} 次`;

      const minus = document.createElement("button");
      minus.className = "counter-btn";
      minus.textContent = "-";

      const count = document.createElement("span");
      count.className = "count-number";
      count.textContent = items[name];

      const plus = document.createElement("button");
      plus.className = "counter-btn";
      plus.textContent = "+";

      minus.onclick = () => {
        let v = parseInt(count.textContent);
        if (v > 0) v--;
        count.textContent = v;
        totalLabel.textContent = `${v * reps} 次`;

        if (v === 0) delete history[date][name];
        else history[date][name] = v;

        saveHistory();
        showHistoryPage();
      };

      plus.onclick = () => {
        let v = parseInt(count.textContent);
        v++;
        count.textContent = v;
        totalLabel.textContent = `${v * reps} 次`;

        history[date][name] = v;
        saveHistory();
      };

      row.appendChild(left);
      row.appendChild(repsLabel);
      row.appendChild(totalLabel);
      row.appendChild(minus);
      row.appendChild(count);
      row.appendChild(plus);

      list.appendChild(row);
    }

    const delCard = document.createElement("div");
    delCard.className = "card";

    const delBtn = document.createElement("button");
    delBtn.className = "small-btn";
    delBtn.textContent = "删除当天数据";

    delBtn.onclick = () => {
      delete history[date];
      saveHistory();
      showHistoryPage();
    };

    delCard.appendChild(delBtn);
    list.appendChild(delCard);
  });
}

/* ============================
   返回主页
============================ */
const backHomeBtn = document.getElementById("backHome");

if (backHomeBtn) {
  backHomeBtn.onclick = () => {
    const homePage = document.getElementById("page-home");
    const historyPage = document.getElementById("page-history");

    if (!homePage || !historyPage) return;

    historyPage.classList.remove("active");
    homePage.classList.add("active");

    renderSubItems();
    updateFooter();
  };
}

/* ============================
   跳转统计页
============================ */
const gotoStatsBtn = document.getElementById("gotoStats");

if (gotoStatsBtn) {
  gotoStatsBtn.onclick = () => {
    window.location.assign("statistics.html");
  };
}

/* ============================
   查 reps
============================ */
function findReps(itemName) {
  for (const part in WORKOUT_GROUPS) {
    for (const obj of WORKOUT_GROUPS[part]) {
      if (obj.name === itemName) return obj.reps;
    }
  }
  return 0;
}

/* ============================
   六维能力能量计算（新增）
============================ */
function calcEnergyByDimension(data) {
  const dimEnergy = {
    balance: 0,
    power: 0,
    endurance: 0,
    flexibility: 0,
    stability: 0,
    coordination: 0
  };

  for (const date in data) {
    const items = data[date];

    for (const name in items) {
      const sets = items[name];
      const reps = findReps(name);
      const energy = sets * reps * 0.6;

      const dim = WORKOUT_DIMENSION_MAP[name] || "endurance";
      dimEnergy[dim] += energy;
    }
  }

  return dimEnergy;
}

/* ============================
   获取最近 N 天数据（统计页用）
============================ */
function getRecentDays(n) {
  const result = {};
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const key = formatLocal(d);
    if (history[key]) result[key] = history[key];
  }

  return result;
}
