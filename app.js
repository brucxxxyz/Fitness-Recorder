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
datePicker.value = todayLocal();

/* ============================
   左右按钮切换日期
============================ */
const prevDateBtn = document.getElementById("prevDate");
const nextDateBtn = document.getElementById("nextDate");

prevDateBtn.onclick = () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() - 1);
  datePicker.value = formatLocal(d);
  datePicker.onchange();
};

nextDateBtn.onclick = () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() + 1);
  datePicker.value = formatLocal(d);
  datePicker.onchange();
};

/* ============================
   填充部位下拉菜单
============================ */
const bodyPartSelect = document.getElementById("bodyPartSelect");
for (const part in WORKOUT_GROUPS) {
  const opt = document.createElement("option");
  opt.value = part;
  opt.textContent = part;
  bodyPartSelect.appendChild(opt);
}

/* ============================
   今日训练渲染
============================ */
function renderSubItems() {
  const part = bodyPartSelect.value;
  const container = document.getElementById("subItemContainer");
  container.innerHTML = "";

  const date = datePicker.value;
  const todayData = history[date] || {};

  WORKOUT_GROUPS[part].forEach((item) => {
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
  box.innerHTML = `
    <div>今日总组数： <b>${totalSets}</b> 组</div>
    <div>今日总次数： <b>${totalReps}</b> 次</div>
    <div>今日总能量： <b>${totalCalories.toFixed(1)}</b> kcal</div>
  `;
}

/* ============================
   切换部位
============================ */
bodyPartSelect.onchange = () => {
  renderSubItems();
};

/* ============================
   切换日期
============================ */
datePicker.onchange = () => {
  renderSubItems();
};

/* ============================
   初次渲染
============================ */
renderSubItems();

/* ============================
   历史记录页
============================ */

function showHistoryPage() {
  document.getElementById("page-home").classList.remove("active");
  document.getElementById("page-history").classList.add("active");

  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const dates = Object.keys(history)
    .filter(d => Object.keys(history[d]).length > 0)
    .sort()
    .reverse();

  dates.forEach(date => {
    // 日期标题
    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = date;
    list.appendChild(title);

    const items = history[date];

    // 1) 按部位分组（只分组存在于 WORKOUT_GROUPS 的动作）
    const grouped = {};
    for (const part in WORKOUT_GROUPS) grouped[part] = [];

    for (const name in items) {
      let found = false;

      for (const part in WORKOUT_GROUPS) {
        if (WORKOUT_GROUPS[part].some(obj => obj.name === name)) {
          grouped[part].push(name);
          found = true;
          break;
        }
      }

      // 如果动作不在 WORKOUT_GROUPS → 自动忽略（避免报错）
      if (!found) {
        console.warn(`历史记录中发现未定义动作：${name}（已忽略）`);
      }
    }

    // 2) 渲染每个部位
    for (const part in grouped) {
      if (grouped[part].length === 0) continue;

      const partTitle = document.createElement("div");
      partTitle.className = "history-title";
      partTitle.style.fontSize = "16px";
      partTitle.style.marginTop = "8px";
      partTitle.textContent = part;
      list.appendChild(partTitle);

      // 3) 按 WORKOUT_GROUPS 顺序渲染动作
      WORKOUT_GROUPS[part].forEach(obj => {
        const name = obj.name;
        if (!items[name]) return;

        const reps = obj.reps;
        const sets = items[name];

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
        totalLabel.textContent = `${sets * reps} 次`;

        const minus = document.createElement("button");
        minus.className = "counter-btn";
        minus.textContent = "-";

        const count = document.createElement("span");
        count.className = "count-number";
        count.textContent = sets;

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
      });
    }

    // 删除当天数据按钮
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
   返回主页（不再重置日期）
============================ */
document.getElementById("backHome").onclick = () => {
  document.getElementById("page-history").classList.remove("active");
  document.getElementById("page-home").classList.add("active");

  renderSubItems();
  updateFooter();
};

/* ============================
   跳转统计页
============================ */
document.getElementById("gotoStats").onclick = () => {
  window.location.href = "statistics.html";
};

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
