/* ============================
   本地存储
============================ */
const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/* ============================
   初始化日期 = 今天
============================ */
const datePicker = document.getElementById("datePicker");
datePicker.value = new Date().toISOString().slice(0, 10);

/* ============================
   日期切换
============================ */
document.getElementById("prevDate").onclick = () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() - 1);
  datePicker.value = d.toISOString().slice(0, 10);
  datePicker.onchange();
};

document.getElementById("nextDate").onclick = () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() + 1);
  datePicker.value = d.toISOString().slice(0, 10);
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
   🌐 语言菜单
============================ */
const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");

langBtn.onclick = () => {
  langMenu.style.display = langMenu.style.display === "block" ? "none" : "block";
};

document.querySelectorAll(".lang-item").forEach(item => {
  item.onclick = () => {
    const lang = item.dataset.lang;
    setLang(lang);
    langMenu.style.display = "none";
    applyLang();
  };
});

/* ============================
   🌙 暗夜模式
============================ */
const themeBtn = document.getElementById("themeBtn");

if (isDarkMode()) {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀️";
}

themeBtn.onclick = () => {
  toggleTheme();
  themeBtn.textContent = isDarkMode() ? "☀️" : "🌙";
};

/* ============================
   🌐 应用语言到页面
============================ */
function applyLang() {
  const L = LANG[currentLang];

  // HTML 标题
  document.getElementById("htmlTitle").textContent = L.title_today;

  // 今日训练页
  document.getElementById("titleToday").textContent = L.title_today;
  document.getElementById("labelDate").textContent = L.date;
  document.getElementById("labelPart").textContent = L.part;
  document.getElementById("gotoHistory").textContent = L.history;
  document.getElementById("gotoStats").textContent = L.stats;

  // 历史页
  document.getElementById("titleHistory").textContent = L.history_title;
  document.getElementById("backHome").textContent = L.back;

  // 今日统计
  updateFooter();

  // 动作名称
  renderSubItems();
}

/* ============================
   今日训练渲染（含翻译）
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
    name.textContent = tAction(item.name); // 🌐 翻译动作名称

    const repsLabel = document.createElement("span");
    repsLabel.className = "reps-label";
    repsLabel.textContent = `${item.reps} ${LANG[currentLang].unit_per_set}`;

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
    total.textContent = `${sets * item.reps} ${LANG[currentLang].unit_times}`;

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
      total.textContent = `${sets * item.reps} ${LANG[currentLang].unit_times}`;
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
   今日统计（含翻译）
============================ */
function updateFooter() {
  const L = LANG[currentLang];
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

  const box = document.getElementById("todaySummary");
  box.innerHTML = `
    <div>${L.total_sets}： <b>${totalSets}</b></div>
    <div>${L.total_reps}： <b>${totalReps}</b></div>
    <div>${L.total_cal}： <b>${totalCalories.toFixed(1)}</b> kcal</div>
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
  updateFooter();
};

/* ============================
   初次渲染
============================ */
renderSubItems();
applyLang();

/* ============================
   历史记录页（含翻译）
============================ */
document.getElementById("gotoHistory").onclick = () => {
  showHistoryPage();
};

function showHistoryPage() {
  document.getElementById("page-home").classList.remove("active");
  document.getElementById("page-history").classList.add("active");

  const L = LANG[currentLang];
  const list = document.getElementById("historyList");
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
      left.textContent = tAction(name); // 🌐 翻译动作名称

      const repsLabel = document.createElement("span");
      repsLabel.className = "reps-label";
      repsLabel.textContent = `${reps} ${L.unit_per_set}`;

      const totalLabel = document.createElement("span");
      totalLabel.className = "total-reps";
      totalLabel.textContent = `${items[name] * reps} ${L.unit_times}`;

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
        totalLabel.textContent = `${v * reps} ${L.unit_times}`;

        if (v === 0) delete history[date][name];
        else history[date][name] = v;

        saveHistory();
        showHistoryPage();
      };

      plus.onclick = () => {
        let v = parseInt(count.textContent);
        v++;
        count.textContent = v;
        totalLabel.textContent = `${v * reps} ${L.unit_times}`;

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
    delBtn.textContent = L.delete_day; // 🌐 翻译删除按钮

    delBtn.onclick = () => {
      delete history[date];
      saveHistory();
      showHistoryPage();
    };

    delCard.appendChild(delBtn);
    list.appendChild(delCard);
  });
}

document.getElementById("backHome").onclick = () => {
  document.getElementById("page-history").classList.remove("active");
  document.getElementById("page-home").classList.add("active");
};

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
