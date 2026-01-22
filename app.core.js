/* ============================
   页面切换
============================ */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

/* ============================
   页面跳转按钮绑定
============================ */

// 首页 → 历史记录
document.getElementById("gotoHistory").addEventListener("click", () => {
  showPage("page-history");
});

// 首页 → 训练统计（跳转到 statistics.html）
document.getElementById("gotoStats").addEventListener("click", () => {
  window.location.href = "statistics.html";
});

// 历史记录 → 返回首页
document.getElementById("backHome").addEventListener("click", () => {
  showPage("page-home");
});


/* ============================
   日期选择器逻辑
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
  datePicker.value = formatDate(date);

  if (typeof loadTodayWorkout === "function") {
    loadTodayWorkout();
  }
}

// 上一天
prevDateBtn.addEventListener("click", () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() - 1);
  setDate(d);
});

// 下一天
nextDateBtn.addEventListener("click", () => {
  const d = new Date(datePicker.value);
  d.setDate(d.getDate() + 1);
  setDate(d);
});

// 手动选择日期
datePicker.addEventListener("change", () => {
  if (typeof loadTodayWorkout === "function") {
    loadTodayWorkout();
  }
});


/* ============================
   初始化
============================ */
function init() {
  // 默认设置今天日期
  const today = new Date();
  datePicker.value = formatDate(today);

  // 加载今日训练
  if (typeof loadTodayWorkout === "function") {
    loadTodayWorkout();
  }

  // 加载历史记录（如果存在）
  if (typeof loadHistory === "function") {
    loadHistory();
  }
}

init();
