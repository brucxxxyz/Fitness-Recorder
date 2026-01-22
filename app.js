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
   初始化日期 = 今天
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
   填充部位下拉菜单（显示翻译）
============================ */
const bodyPartSelect = document.getElementById("bodyPartSelect");
for (const part in WORKOUT_GROUPS) {
  const opt = document.createElement("option");
  opt.value = part;
  opt.textContent = t("body_" + part); // ⭐ 使用语言包翻译
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

    /* --- 动作名（根据语言显示） --- */
    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.name[currentLang];

    /* --- reps 文案 --- */
    const repsLabel = document.createElement("span");
    repsLabel.className = "reps-label";
    repsLabel.textContent = t("reps_per_set", { reps: item.reps });

    /* --- 总次数 --- */
    const total = document.createElement("span");
    total.className = "total-reps";

    /* --- 加减按钮 --- */
    const minus = document.createElement("button");
    minus.className = "counter-btn";
    minus.textContent = "-";

    const count = document.createElement("span");
    count.className = "count-number";

    const plus = document.createElement("button");
    plus.className = "counter-btn";
    plus.textContent = "+";

    /* --- sets 数据（key 使用中文动作名） --- */
    const keyName = item.name.zh; // 数据 key 永远用中文
    let sets = todayData[keyName] || 0;

    count.textContent = sets;
    total.textContent = t("total_reps", { total: sets * item.reps });

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

      if (sets > 0) history[date][keyName] = sets;
      else delete history[date][keyName];

      saveHistory();
      updateRow();
      updateFooter();
    }

    function updateRow() {
      count.textContent = sets;
      total.textContent = t("total_reps", { total: sets * item.reps });
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

  for (const keyName in todayData) {
    const sets = todayData[keyName];
    const reps = findReps(keyName);

    totalSets += sets;
    totalReps += sets * reps;
    totalCalories += sets * reps * 0.6;
  }

  renderFooter(totalSets, totalReps, totalCalories);
}

function renderFooter(totalSets, totalReps, totalCalories) {
  const box = document.getElementById("todaySummary");
  box.innerHTML = `
    <div>${t("today_sets")} <b>${totalSets}</b></div>
    <div>${t("today_reps")} <b>${totalReps}</b></div>
    <div>${t("today_calories")} <b>${totalCalories.toFixed(1)}</b> kcal</div>
  `;
}

/* ============================
   查 reps（根据中文 key）
============================ */
function findReps(itemNameZh) {
  for (const part in WORKOUT_GROUPS) {
    for (const obj of WORKOUT_GROUPS[part]) {
      if (obj.name.zh === itemNameZh) return obj.reps;
    }
  }
  return 0;
}

/* ============================
   切换部位 & 日期
============================ */
bodyPartSelect.onchange = () => renderSubItems();
datePicker.onchange = () => renderSubItems();

/* ============================
   初次渲染
============================ */
renderSubItems();

/* ============================
   跳转
============================ */
document.getElementById("gotoHistory").onclick = () => {
  window.location.assign("history.html");
};

document.getElementById("gotoStats").onclick = () => {
  window.location.assign("statistics.html");
};

/* ============================
   初始化语言 + 暗夜模式 + 文案
============================ */
initLanguageMenu();
initDarkMode();
applyLangIndex();
