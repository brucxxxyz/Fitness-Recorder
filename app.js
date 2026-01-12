/* ============================
   初始化
============================ */

const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

const datePicker = document.getElementById("datePicker");
const bodyPartSelect = document.getElementById("bodyPartSelect");
const subItemContainer = document.getElementById("subItemContainer");
const todaySummary = document.getElementById("todaySummary");

/* ============================
   日期初始化
============================ */

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function loadToday() {
  const today = new Date();
  datePicker.value = formatDate(today);
}

loadToday();

/* 上一天 / 下一天 */
document.getElementById("prevDate").onclick = () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() - 1);
  datePicker.value = formatDate(d);
  renderPage();
};

document.getElementById("nextDate").onclick = () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() + 1);
  datePicker.value = formatDate(d);
  renderPage();
};

datePicker.onchange = renderPage;

/* ============================
   部位选择
============================ */

function loadBodyParts() {
  bodyPartSelect.innerHTML = "";

  for (const part in WORKOUT_GROUPS) {
    const opt = document.createElement("option");
    opt.value = part;
    opt.textContent = part;
    bodyPartSelect.appendChild(opt);
  }
}

loadBodyParts();

bodyPartSelect.onchange = renderPage;

/* ============================
   渲染动作列表
============================ */

function renderPage() {
  const dateKey = datePicker.value;
  const part = bodyPartSelect.value;

  const items = WORKOUT_GROUPS[part];
  const saved = history[dateKey] || {};

  subItemContainer.innerHTML = "";

  items.forEach(obj => {
    const row = document.createElement("div");
    row.className = "subitem-row";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = obj.name;

    const reps = document.createElement("div");
    reps.className = "reps-label";
    reps.textContent = obj.reps + " 次";

    const minus = document.createElement("button");
    minus.className = "counter-btn";
    minus.textContent = "-";

    const count = document.createElement("div");
    count.className = "count-number";
    count.textContent = saved[obj.name] || 0;

    const plus = document.createElement("button");
    plus.className = "counter-btn";
    plus.textContent = "+";

    minus.onclick = () => {
      let v = parseInt(count.textContent);
      if (v > 0) v--;
      count.textContent = v;
      saveItem(obj.name, v);
    };

    plus.onclick = () => {
      let v = parseInt(count.textContent);
      v++;
      count.textContent = v;
      saveItem(obj.name, v);
    };

    row.appendChild(name);
    row.appendChild(reps);
    row.appendChild(minus);
    row.appendChild(count);
    row.appendChild(plus);

    subItemContainer.appendChild(row);
  });

  renderSummary();
}

/* ============================
   保存数据
============================ */

function saveItem(name, sets) {
  const dateKey = datePicker.value;

  if (!history[dateKey]) history[dateKey] = {};

  if (sets === 0) {
    delete history[dateKey][name];
  } else {
    history[dateKey][name] = sets;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderSummary();
}

/* ============================
   今日总结
============================ */

function renderSummary() {
  const dateKey = datePicker.value;
  const items = history[dateKey] || {};

  let totalReps = 0;

  for (const name in items) {
    const sets = items[name];
    const reps = findReps(name);
    totalReps += reps * sets;
  }

  todaySummary.innerHTML = `
    <div class="history-title">今日总次数</div>
    <div>${totalReps} 次</div>
  `;
}

/* 查 reps */
function findReps(itemName) {
  for (const part in WORKOUT_GROUPS) {
    for (const obj of WORKOUT_GROUPS[part]) {
      if (obj.name === itemName) return obj.reps;
    }
  }
  return 0;
}

/* ============================
   页面跳转
============================ */

document.getElementById("gotoHistory").onclick = () => {
  document.getElementById("page-home").classList.remove("active");
  document.getElementById("page-history").classList.add("active");

  renderHistory();
};

document.getElementById("backHome").onclick = () => {
  document.getElementById("page-history").classList.remove("active");
  document.getElementById("page-home").classList.add("active");
};

document.getElementById("gotoStats").onclick = () => {
  window.location.href = "statistics.html";
};

/* ============================
   历史记录
============================ */

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const dates = Object.keys(history).sort().reverse();

  dates.forEach(date => {
    const row = document.createElement("div");
    row.className = "history-row";

    const left = document.createElement("div");
    left.textContent = date;

    const right = document.createElement("div");
    right.textContent = getDayTotal(date) + " 次";

    row.appendChild(left);
    row.appendChild(right);

    list.appendChild(row);
  });
}

function getDayTotal(dateKey) {
  const items = history[dateKey] || {};
  let total = 0;

  for (const name in items) {
    const sets = items[name];
    const reps = findReps(name);
    total += reps * sets;
  }

  return total;
}

/* ============================
   初始化渲染
============================ */

renderPage();
