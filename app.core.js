/* ============================
   页面切换（仅 index.html 使用）
============================ */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");
}

/* ============================
   页面跳转按钮绑定（安全版）
============================ */

// 首页 → 历史记录
const btnHistory = document.getElementById("gotoHistory");
if (btnHistory) {
  btnHistory.addEventListener("click", () => {
    showPage("page-history");
  });
}

// 首页 → 训练统计（跳转到 statistics.html）
const btnStats = document.getElementById("gotoStats");
if (btnStats) {
  btnStats.addEventListener("click", () => {
    window.location.href = "statistics.html";
  });
}

// 历史记录 → 返回首页
const btnBackHome = document.getElementById("backHome");
if (btnBackHome) {
  btnBackHome.addEventListener("click", () => {
    showPage("page-home");
  });
}

/* ============================
   日期选择器逻辑（安全版）
============================ */

const datePicker = document.getElementById("datePicker");
const prevDateBtn = document.getElementById("prevDate");
const nextDateBtn = document.getElementById("nextDate");

// 格式化日期 yyyy-mm-dd
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// 设置日期并刷新今日训练
function setDate(date) {
  if (!datePicker) return;
  datePicker.value = formatDate(date);

  if (typeof loadTodayWorkout === "function") {
    loadTodayWorkout();
  }
}

// 上一天
if (prevDateBtn) {
  prevDateBtn.addEventListener("click", () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() - 1);
    setDate(d);
  });
}

// 下一天
if (nextDateBtn) {
  nextDateBtn.addEventListener("click", () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() + 1);
    setDate(d);
  });
}

// 手动选择日期
if (datePicker) {
  datePicker.addEventListener("change", () => {
    if (typeof loadTodayWorkout === "function") {
      loadTodayWorkout();
    }
  });
}

/* ============================
   初始化（安全版）
============================ */
function init() {
  // 默认设置今天日期
  if (datePicker) {
    const today = new Date();
    datePicker.value = formatDate(today);
  }

  // 加载今日训练
  if (typeof loadTodayWorkout === "function") {
    loadTodayWorkout();
  }

  // 加载历史记录
  if (typeof loadHistory === "function") {
    loadHistory();
  }
}

/* ============================
   正确的初始化顺序
============================ */
document.addEventListener("DOMContentLoaded", () => {
  // 先翻译 UI（语言系统）
  applyLanguage(currentLang);

  // 再加载数据（今日训练 + 历史记录）
  init();
});

/* ============================
   加载今日训练（主页核心函数）
============================ */
function loadTodayWorkout() {
  const partSelect = document.getElementById("bodyPartSelect");
  const container = document.getElementById("subItemContainer");
  const summaryBox = document.getElementById("todaySummary");
  const date = document.getElementById("datePicker")?.value;

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
    const row = document.createElement("div");
    row.className = "subitem-row";

    const name = item.name;
    const reps = item.reps;

    const sets = history[date]?.[name] || 0;

    row.innerHTML = `
      <div class="item-name" data-original-name="${name}">
        ${getLocalizedWorkout(name)}
      </div>

      <div class="reps-label">${reps} 次</div>

      <button class="counter-btn minus">-</button>
      <div class="count-number">${sets}</div>
      <button class="counter-btn plus">+</button>
    `;

    /* 加减按钮逻辑 */
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

  /* 3. 翻译动作名称 */
  translateTodayList();

  /* 4. 更新今日统计 */
  translateSummary();
}

/* ============================
   保存某个动作的组数
============================ */
function saveSet(date, name, sets) {
  if (!history[date]) history[date] = {};
  history[date][name] = sets;
  localStorage.setItem("fitness_history", JSON.stringify(history));
}

