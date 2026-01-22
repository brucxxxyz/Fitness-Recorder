/* ============================
   本地存储
============================ */
const STORAGE_KEY = "fitness_history_v13";
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

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
   计算某天总能量
============================ */
function getDayCalories(date) {
  const items = history[date] || {};
  let total = 0;

  for (const name in items) {
    const sets = items[name];
    const reps = findReps(name);
    total += sets * reps * 0.6;
  }
  return total.toFixed(1);
}

/* ============================
   渲染历史记录（折叠版）
============================ */
function showHistoryPage() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const dates = Object.keys(history)
    .filter(d => Object.keys(history[d]).length > 0)
    .sort()
    .reverse();

  dates.forEach(date => {
    const dayCard = document.createElement("div");
    dayCard.className = "card";

    /* --- 折叠标题行 --- */
    const header = document.createElement("div");
    header.className = "history-row";
    header.style.cursor = "pointer";

    const title = document.createElement("span");
    title.textContent = date;

    const calories = document.createElement("span");
    calories.textContent = `🔥 ${getDayCalories(date)} kcal`;

    header.appendChild(title);
    header.appendChild(calories);

    /* --- 内容区（默认折叠） --- */
    const content = document.createElement("div");
    content.style.display = "none";
    content.style.marginTop = "10px";

    const items = history[date];

    for (const name in items) {
      const reps = findReps(name);

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
        calories.textContent = `🔥 ${getDayCalories(date)} kcal`;
        if (v === 0) showHistoryPage();
      };

      plus.onclick = () => {
        let v = parseInt(count.textContent);
        v++;
        count.textContent = v;
        totalLabel.textContent = `${v * reps} 次`;

        history[date][name] = v;
        saveHistory();
        calories.textContent = `🔥 ${getDayCalories(date)} kcal`;
      };

      row.appendChild(left);
      row.appendChild(repsLabel);
      row.appendChild(totalLabel);
      row.appendChild(minus);
      row.appendChild(count);
      row.appendChild(plus);

      content.appendChild(row);
    }

    /* --- 删除当天按钮 --- */
    const delBtn = document.createElement("button");
    delBtn.className = "small-btn";
    delBtn.textContent = "删除当天数据";
    delBtn.style.marginTop = "10px";

    delBtn.onclick = () => {
      delete history[date];
      saveHistory();
      showHistoryPage();
    };

    content.appendChild(delBtn);

    /* --- 点击标题折叠/展开 --- */
    header.onclick = () => {
      content.style.display = content.style.display === "none" ? "block" : "none";
    };

    dayCard.appendChild(header);
    dayCard.appendChild(content);
    list.appendChild(dayCard);
  });
}

/* ============================
   返回主页
============================ */
document.getElementById("backHome").onclick = () => {
  window.location.assign("index.html");
};

/* ============================
   初次渲染
============================ */
showHistoryPage();
