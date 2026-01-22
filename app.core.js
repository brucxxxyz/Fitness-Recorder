/* ============================
   全局历史数据（必须放最顶部）
============================ */
let history = JSON.parse(localStorage.getItem("fitness_history") || "{}");

/* ============================
   页面切换（仅 index.html 使用）
============================ */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");
}

/* ============================
   页面跳转按钮绑定
============================ */
const btnHistory = document.getElementById("gotoHistory");
if (btnHistory) {
  btnHistory.addEventListener("click", () => showPage("page-history"));
}

const btnStats = document.getElementById("gotoStats");
if (btnStats) {
  btnStats.addEventListener("click", () => {
    window.location.href = "statistics.html";
  });
}

const btnBackHome = document.getElementById("backHome");
if (btnBackHome) {
  btnBackHome.addEventListener("click", () => showPage("page-home"));
}

/* ============================
   删除当天数据按钮
============================ */
const btnDeleteDay = document.getElementById("deleteDay");
if (btnDeleteDay) {
  btnDeleteDay.addEventListener("click", () => {
    const date = document.getElementById("datePicker")?.value;
    if (!date) return;

    delete history[date];
    localStorage.setItem("fitness_history", JSON.stringify(history));

    loadHistory();
    translateSummary();
  });
}

/* ============================
   日期选择器逻辑
============================ */
const datePicker = document.getElementById("datePicker");
const prevDateBtn = document.getElementById("prevDate");
const nextDateBtn = document.getElementById("nextDate");

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function setDate(date) {
  if (!datePicker) return;
  datePicker.value = formatDate(date);
  loadTodayWorkout();
}

if (prevDateBtn) {
  prevDateBtn.addEventListener("click", () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() - 1);
    setDate(d);
  });
}

if (nextDateBtn) {
  nextDateBtn.addEventListener("click", () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() + 1);
    setDate(d);
  });
}

if (datePicker) {
  datePicker.addEventListener("change", () => loadTodayWorkout());
}

/* ============================
   加载今日训练（主页核心）
============================ */
function loadTodayWorkout() {
  const partSelect = document.getElementById("bodyPartSelect");
  const container = document.getElementById("subItemContainer");
  const date = datePicker?.value;

  if (!partSelect || !container || !date) return;

  /* 1. 生成部位下拉菜单 */
  if (partSelect.options.length === 0) {
    Object.keys(WORKOUT_GROUPS).forEach(part => {
      const opt = document.createElement("option");
      opt.value = part;
      opt.textContent = getLocalizedPart(part);
      partSelect.appendChild(opt);
    });
  }

  const selectedPart = partSelect.value || Object.keys(WORKOUT_GROUPS)[0];

  /* 2. 生成动作列表 */
  container.innerHTML = "";

  WORKOUT_GROUPS[selectedPart].forEach(item => {
    const name = item.name;
    const reps = item.reps;
    const sets = history[date]?.[name] || 0;

    const row = document.createElement("div");
    row.className = "subitem-row";

    row.innerHTML = `
      <div class="item-name" data-original-name="${name}">
        ${getLocalizedWorkout(name)}
      </div>
      <div class="reps-label">${reps} 次</div>
      <button class="counter-btn minus">-</button>
      <div class="count-number">${sets}</div>
      <button class="counter-btn plus">+</button>
    `;

    const minus = row.querySelector(".minus");
    const plus = row.querySelector(".plus");
    const count = row.querySelector(".count-number");

    minus.addEventListener("click", () => {
      let v = parseInt(count.textContent);
      if (v > 0) v--;
      count.textContent = v;
      saveSet(date, name, v);
      translateSummary();
    });

    plus.addEventListener("click", () => {
      let v = parseInt(count.textContent);
      v++;
      count.textContent = v;
      saveSet(date, name, v);
      translateSummary();
    });

    container.appendChild(row);
  });

  translateTodayList();
  translateSummary();
}

/* ============================
   保存组数
============================ */
function saveSet(date, name, sets) {
  if (!history[date]) history[date] = {};
  history[date][name] = sets;
  localStorage.setItem("fitness_history", JSON.stringify(history));
}

/* ============================
   加载历史记录（可编辑 + 0 组不显示）
============================ */
function loadHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;

  list.innerHTML = "";

  const dates = Object.keys(history).sort().reverse();

  dates.forEach(date => {
    const dayData = history[date];
    const div = document.createElement("div");
    div.className = "history-day card";

    let html = `<h3>${date}</h3>`;

    for (const name in dayData) {
      const sets = dayData[name];

      // ⭐ 0 组不显示
      if (sets === 0) continue;

      html += `
        <div class="history-row">
          <span class="item-name" data-original-name="${name}">
            ${getLocalizedWorkout(name)}
          </span>

          <div class="history-counter">
            <button class="h-minus">-</button>
            <div class="h-count">${sets}</div>
            <button class="h-plus">+</button>
          </div>
        </div>
      `;
    }

    div.innerHTML = html;
    list.appendChild(div);

    // ⭐ 绑定加减按钮
    div.querySelectorAll(".history-row").forEach(row => {
      const itemName = row.querySelector(".item-name").dataset.originalName;
      const minus = row.querySelector(".h-minus");
      const plus = row.querySelector(".h-plus");
      const count = row.querySelector(".h-count");

      minus.addEventListener("click", () => {
        let v = parseInt(count.textContent);
        if (v > 0) v--;
        saveSet(date, itemName, v);
        loadHistory(); // 自动刷新（0 组会消失）
      });

      plus.addEventListener("click", () => {
        let v = parseInt(count.textContent);
        v++;
        saveSet(date, itemName, v);
        loadHistory();
      });
    });
  });

  translateHistoryList();
}

/* ============================
   初始化
============================ */
function init() {
  if (datePicker) {
    const today = new Date();
    datePicker.value = formatDate(today);
  }

  loadTodayWorkout();
  loadHistory();
}

/* ============================
   启动
============================ */
document.addEventListener("DOMContentLoaded", () => {
  applyLanguage(currentLang);
  init();
});
