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
    const sets = saved[obj.name] || 0;
    const reps = obj.reps;
    const totalReps = sets * reps;
    const totalCalories = totalReps * 0.6;

    const row = document.createElement("div");
    row.className = "subitem-row";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = obj.name;

    const repsLabel = document.createElement("div");
    repsLabel.className = "reps-label";
    repsLabel.textContent = `${reps} 次`;

    const minus = document.createElement("button");
    minus.className = "counter-btn";
    minus.textContent = "-";

    const count = document.createElement("div");
    count.className = "count-number";
    count.textContent = sets;

    const plus = document.createElement("button");
    plus.className = "counter-btn";
    plus.textContent = "+";

    const detail = document.createElement("div");
    detail.className = "total-reps";
    detail.textContent = `${totalReps} 次 / ${totalCalories.toFixed(1)} kcal`;

    minus.onclick = () => {
      let v = parseInt(count.textContent);
      if (v > 0) v--;
      count.textContent = v;
      saveItem(obj.name, v);
      renderPage();
    };

    plus.onclick = () => {
      let v = parseInt(count.textContent);
      v++;
      count.textContent = v;
      saveItem(obj.name, v);
      renderPage();
    };

    row.appendChild(name);
    row.appendChild(repsLabel);
    row.appendChild(minus);
    row.appendChild(count);
    row.appendChild(plus);
    row.appendChild(detail);

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

  let totalSets = 0;
  let totalReps = 0;
  let totalCalories = 0;

  for (const name in items) {
    const sets = items[name];
    const reps = findReps(name);
    const cals = reps * 0.6;

    totalSets += sets;
    totalReps += reps * sets;
    totalCalories += cals * sets;
  }

  todaySummary.innerHTML = `
    <div class="history-title">今日总结</div>
    <div>总组数：${totalSets} 组</div>
    <div>总次数：${totalReps} 次</div>
    <div>总能量：${totalCalories.toFixed(1)} kcal</div>
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
   历史记录
============================ */

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const dates = Object.keys(history).sort().reverse();

  // 没有记录 → 不显示任何卡片
  if (dates.length === 0) return;

  dates.forEach(date => {
    const dayData = history[date];
    if (!dayData) return;

    const container = document.createElement("div");
    container.className = "card";

    /* ============================
       计算每日总组数 / 次数 / 能量
    ============================= */
    let totalSets = 0;
    let totalReps = 0;
    let totalCalories = 0;

    for (const itemName in dayData) {
      const sets = dayData[itemName];
      const reps = findReps(itemName);
      const cals = reps * 0.6;

      totalSets += sets;
      totalReps += reps * sets;
      totalCalories += cals * sets;
    }

    /* ============================
       标题行（日期 + 总计 + 删除按钮）
    ============================= */
    const header = document.createElement("div");
    header.className = "history-row";

    const left = document.createElement("div");
    left.textContent = date;

    const right = document.createElement("div");
    right.innerHTML = `
      ${totalSets} 组<br>
      ${totalReps} 次<br>
      ${totalCalories.toFixed(1)} kcal
    `;

    const delBtn = document.createElement("button");
    delBtn.textContent = "删除";
    delBtn.style.width = "60px";
    delBtn.style.height = "32px";
    delBtn.style.fontSize = "14px";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = () => {
      delete history[date];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      renderHistory();
    };

    const headerRight = document.createElement("div");
    headerRight.style.display = "flex";
    headerRight.style.flexDirection = "column";
    headerRight.style.alignItems = "flex-end";
    headerRight.appendChild(right);
    headerRight.appendChild(delBtn);

    header.appendChild(left);
    header.appendChild(headerRight);

    container.appendChild(header);

    /* ============================
       每个动作的可编辑行
    ============================= */
    const detailBox = document.createElement("div");
    detailBox.style.marginTop = "10px";

    for (const itemName in dayData) {
      const sets = dayData[itemName];
      const reps = findReps(itemName);

      const row = document.createElement("div");
      row.className = "history-row";

      const name = document.createElement("div");
      name.textContent = itemName;

      const minus = document.createElement("button");
      minus.textContent = "-";
      minus.className = "counter-btn";
      minus.style.width = "32px";
      minus.style.height = "32px";

      const count = document.createElement("div");
      count.textContent = sets;
      count.style.minWidth = "24px";
      count.style.textAlign = "center";

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.className = "counter-btn";
      plus.style.width = "32px";
      plus.style.height = "32px";

      const detail = document.createElement("div");
      detail.textContent = `${sets} 组 × ${reps} 次 = ${sets * reps}`;

      // 修改历史记录（减少）
      minus.onclick = () => {
        let v = parseInt(count.textContent);
        if (v > 0) v--;
        count.textContent = v;

        if (v === 0) delete history[date][itemName];
        else history[date][itemName] = v;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        renderHistory();
      };

      // 修改历史记录（增加）
      plus.onclick = () => {
        let v = parseInt(count.textContent);
        v++;
        count.textContent = v;

        history[date][itemName] = v;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        renderHistory();
      };

      const rightBox = document.createElement("div");
      rightBox.style.display = "flex";
      rightBox.style.alignItems = "center";
      rightBox.style.gap = "6px";
      rightBox.appendChild(minus);
      rightBox.appendChild(count);
      rightBox.appendChild(plus);

      row.appendChild(name);
      row.appendChild(rightBox);
      row.appendChild(detail);

      detailBox.appendChild(row);
    }

    container.appendChild(detailBox);
    list.appendChild(container);
  });
}

/* ============================
   初始化渲染
============================ */

renderPage();