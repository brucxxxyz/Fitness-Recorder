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
   渲染动作列表（主页）
============================ */

function renderPage() {
  const dateKey = datePicker.value;
  const part = bodyPartSelect.value;

  if (!history[dateKey]) {
    history[dateKey] = {};
  }

  const items = WORKOUT_GROUPS[part];
  const saved = history[dateKey];

  subItemContainer.innerHTML = "";

  items.forEach(obj => {
    const sets = saved[obj.name] || 0;
    const reps = obj.reps;
    const totalReps = sets * reps;

    const row = document.createElement("div");
    row.className = "subitem-row";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = obj.name;

    const repsLabel = document.createElement("div");
    repsLabel.className = "reps-label";
    repsLabel.textContent = `${reps} 次/组`;

    const totalLabel = document.createElement("div");
    totalLabel.className = "total-reps";
    totalLabel.textContent = `${totalReps} 次`;

    const minus = document.createElement("button");
    minus.className = "counter-btn";
    minus.textContent = "-";

    const count = document.createElement("div");
    count.className = "count-number";
    count.textContent = sets;

    const plus = document.createElement("button");
    plus.className = "counter-btn";
    plus.textContent = "+";

    minus.onclick = () => {
      let v = parseInt(count.textContent);
      if (v > 0) v--;
      saveItem(obj.name, v);
      renderPage();
    };

    plus.onclick = () => {
      let v = parseInt(count.textContent);
      v++;
      saveItem(obj.name, v);
      renderPage();
    };

    row.appendChild(name);
    row.appendChild(repsLabel);
    row.appendChild(totalLabel);
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

  if (!history[dateKey]) {
    history[dateKey] = {};
  }

  if (sets === 0) {
    delete history[dateKey][name];
  } else {
    history[dateKey][name] = sets;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/* ============================
   今日总结
============================ */

function renderSummary() {
  const dateKey = datePicker.value;
  const items = history[dateKey] || {};

  let totalSets = 0;
  let totalReps = 0;

  for (const name in items) {
    const sets = items[name];
    const reps = findReps(name);

    totalSets += sets;
    totalReps += reps * sets;
  }

  todaySummary.innerHTML = `
    <div class="history-title">今日总结</div>
    <div>总组数：${totalSets} 组</div>
    <div>总次数：${totalReps} 次</div>
  `;
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
   历史记录（可编辑）
============================ */

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const dates = Object.keys(history).sort().reverse();

  if (dates.length === 0) return;

  dates.forEach(date => {
    const dayData = history[date];

    if (!dayData || Object.keys(dayData).length === 0) {
      return;
    }

    const container = document.createElement("div");
    container.className = "card";

    const header = document.createElement("div");
    header.className = "history-row";

    const left = document.createElement("div");
    left.textContent = date;

    const delBtn = document.createElement("button");
    delBtn.textContent = "删除";
    delBtn.onclick = () => {
      delete history[date];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      renderHistory();
    };

    header.appendChild(left);
    header.appendChild(delBtn);
    container.appendChild(header);

    for (const itemName in dayData) {
      const sets = dayData[itemName];
      const reps = findReps(itemName);
      const totalReps = sets * reps;

      const row = document.createElement("div");
      row.className = "subitem-row";

      const name = document.createElement("div");
      name.className = "item-name";
      name.textContent = itemName;

      const repsLabel = document.createElement("div");
      repsLabel.className = "reps-label";
      repsLabel.textContent = `${reps} 次/组`;

      const totalLabel = document.createElement("div");
      totalLabel.className = "total-reps";
      totalLabel.textContent = `${totalReps} 次`;

      const minus = document.createElement("button");
      minus.className = "counter-btn";
      minus.textContent = "-";

      const count = document.createElement("div");
      count.className = "count-number";
      count.textContent = sets;

      const plus = document.createElement("button");
      plus.className = "counter-btn";
      plus.textContent = "+";

      minus.onclick = () => {
        let v = parseInt(count.textContent);
        if (v > 0) v--;
        saveItem(itemName, v);
        renderHistory();
      };

      plus.onclick = () => {
        let v = parseInt(count.textContent);
        v++;
        saveItem(itemName, v);
        renderHistory();
      };

      row.appendChild(name);
      row.appendChild(repsLabel);
      row.appendChild(totalLabel);
      row.appendChild(minus);
      row.appendChild(count);
      row.appendChild(plus);

      container.appendChild(row);
    }

    list.appendChild(container);
  });
}

/* ============================
   初始化渲染
============================ */

renderPage();
