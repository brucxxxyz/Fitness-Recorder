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
  opt.textContent = part; // 部位翻译将来可在这里挂接
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
    name.textContent = item.name; // 动作翻译将来可在这里挂接

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
document.getElementById("gotoHistory").onclick = () => {
  showHistoryPage();
};

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
      left.textContent = name; // 将来可用翻译名替换

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
  window.location.assign("statistics.html");
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

/* ============================
   🌐 语言 & 🌙 主题：状态
============================ */
let currentLang = localStorage.getItem("fitness_lang") || "zh";

/* ============================
   🌐 语言菜单逻辑
============================ */
const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");

if (langBtn && langMenu) {
  langBtn.onclick = () => {
    langMenu.classList.toggle("hidden");
  };

  langMenu.querySelectorAll("[data-lang]").forEach(item => {
    item.onclick = () => {
      const lang = item.dataset.lang;
      currentLang = lang;
      localStorage.setItem("fitness_lang", lang);
      langMenu.classList.add("hidden");
      applyLanguage(lang);
    };
  });
}

/* ============================
   🌙 暗夜模式切换
============================ */
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  themeToggle.onclick = () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("fitness_theme", isDark ? "dark" : "light");
  };
}

/* ============================
   🌙 启动时恢复暗夜模式
============================ */
(function restoreTheme() {
  const saved = localStorage.getItem("fitness_theme");
  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  }
})();

/* ============================
   🌐 启动时恢复语言（UI 级）
============================ */
(function restoreLanguage() {
  applyLanguage(currentLang);
})();

/* ============================
   🌐 UI 翻译（Index 页）
   👉 动作/部位翻译留给 workouts.js 提供映射
============================ */
const LANG_UI = {
  zh: {
    homeTitle: "今日训练",
    historyTitle: "历史记录",
    btnHistory: "查看历史记录",
    btnStats: "训练统计",
    btnBack: "返回",
    deleteDay: "删除当天数据",
    summary: (sets, reps, cal) => `
      <div>今日总组数： <b>${sets}</b> 组</div>
      <div>今日总次数： <b>${reps}</b> 次</div>
      <div>今日总能量： <b>${cal.toFixed(1)}</b> kcal</div>
    `
  },
  hk: {
    homeTitle: "今日訓練",
    historyTitle: "歷史記錄",
    btnHistory: "查看歷史記錄",
    btnStats: "訓練統計",
    btnBack: "返回",
    deleteDay: "刪除當天數據",
    summary: (sets, reps, cal) => `
      <div>今日總組數： <b>${sets}</b> 組</div>
      <div>今日總次數： <b>${reps}</b> 次</div>
      <div>今日總能量： <b>${cal.toFixed(1)}</b> kcal</div>
    `
  },
  en: {
    homeTitle: "Today's Workout",
    historyTitle: "History",
    btnHistory: "View History",
    btnStats: "Statistics",
    btnBack: "Back",
    deleteDay: "Delete This Day",
    summary: (sets, reps, cal) => `
      <div>Total Sets: <b>${sets}</b></div>
      <div>Total Reps: <b>${reps}</b></div>
      <div>Total Energy: <b>${cal.toFixed(1)}</b> kcal</div>
    `
  }
};

function applyLanguage(lang) {
  const t = LANG_UI[lang] || LANG_UI.zh;

  // 页面标题（主页 / 历史）
  const homeTitle = document.querySelector("#page-home .page-title");
  const historyTitle = document.querySelector("#page-history .page-title");
  if (homeTitle) homeTitle.innerText = t.homeTitle;
  if (historyTitle) historyTitle.innerText = t.historyTitle;

  // 按钮
  const btnHistory = document.getElementById("gotoHistory");
  const btnStats = document.getElementById("gotoStats");
  const btnBackHome = document.getElementById("backHome");

  if (btnHistory) btnHistory.innerText = t.btnHistory;
  if (btnStats) btnStats.innerText = t.btnStats;
  if (btnBackHome) btnBackHome.innerText = t.btnBack;

  // 历史页删除按钮文本在 showHistoryPage 里用 t.deleteDay
  // 今日统计区域在 renderFooter 里可改用 t.summary
}
