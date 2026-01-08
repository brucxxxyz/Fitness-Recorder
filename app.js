const STORAGE_KEY = "fitness_history_v13";

// 读取历史记录
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

// 保存历史记录
function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// 初始化日期为今天
document.getElementById("datePicker").value = new Date().toISOString().slice(0, 10);

// 填充锻炼部位下拉菜单
const bodyPartSelect = document.getElementById("bodyPartSelect");
for (const part in WORKOUT_GROUPS) {
  const option = document.createElement("option");
  option.value = part;
  option.textContent = part;
  bodyPartSelect.appendChild(option);
}

// 渲染今日训练动作
function renderSubItems() {
  const part = bodyPartSelect.value;
  const container = document.getElementById("subItemContainer");
  container.innerHTML = "";

  const date = document.getElementById("datePicker").value;
  const todayData = history[date] || {};

  let totalSetsAll = 0;
  let totalRepsAll = 0;
  let totalCaloriesAll = 0;

  WORKOUT_GROUPS[part].forEach(item => {
    const row = document.createElement("div");
    row.className = "subitem-row";

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.name;

    const repsLabel = document.createElement("span");
    repsLabel.className = "reps-label";
    repsLabel.textContent = `${item.reps} 次/组`;

    const setsLabel = document.createElement("span");
    setsLabel.className = "sets-label";

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

    // 读取历史记录
    let sets = todayData[item.name] || 0;
    count.textContent = sets;

    // 显示组数
    setsLabel.textContent = `${sets} 组`;

    // 显示总次数
    total.textContent = `${sets * item.reps} 次`;

    // 累加今日统计
    totalSetsAll += sets;
    totalRepsAll += sets * item.reps;
    totalCaloriesAll += sets * item.reps * 0.6;

    minus.onclick = () => {
      if (sets > 0) sets--;
      updateRow();
      updateFooter();
    };

    plus.onclick = () => {
      sets++;
      updateRow();
      updateFooter();
    };

    function updateRow() {
      count.textContent = sets;
      setsLabel.textContent = `${sets} 组`;
      total.textContent = `${sets * item.reps} 次`;
    }

    row.appendChild(name);
    row.appendChild(repsLabel);
    row.appendChild(setsLabel);
    row.appendChild(total);
    row.appendChild(minus);
    row.appendChild(count);
    row.appendChild(plus);

    container.appendChild(row);
  });

  // 渲染底部统计
  renderFooter(totalSetsAll, totalRepsAll, totalCaloriesAll);
}

// 底部统计卡片
function renderFooter(totalSets, totalReps, totalCalories) {
  const box = document.getElementById("todaySummary");
  box.innerHTML = `
    <div>今日总组数： <b>${totalSets}</b> 组</div>
    <div>今日总次数： <b>${totalReps}</b> 次</div>
    <div>今日总能量： <b>${totalCalories.toFixed(1)}</b> kcal</div>
  `;
}

bodyPartSelect.onchange = renderSubItems;
renderSubItems();

// 保存今日训练
document.getElementById("gotoHistory").onclick = () => {
  const date = document.getElementById("datePicker").value;
  if (!history[date]) history[date] = {};

  const part = bodyPartSelect.value;
  const items = WORKOUT_GROUPS[part];

  const rows = document.querySelectorAll("#subItemContainer .subitem-row");
  rows.forEach((row, index) => {
    const name = items[index].name;
    const sets = parseInt(row.children[5].textContent); // count-number

    if (sets > 0) {
      history[date][name] = sets;
    } else {
      delete history[date][name];
    }
  });

  saveHistory();
  showHistoryPage();
};

// 显示历史记录页
function showHistoryPage() {
  document.getElementById("page-home").classList.remove("active");
  document.getElementById("page-history").classList.add("active");

  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const dates = Object.keys(history).sort().reverse();

  dates.forEach(date => {
    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = date;
    list.appendChild(title);

    const items = history[date];
    for (const name in items) {
      const row = document.createElement("div");
      row.className = "subitem-row";

      const left = document.createElement("span");
      left.className = "item-name";
      left.textContent = name;

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
        history[date][name] = v;
        if (v === 0) delete history[date][name];
        saveHistory();
      };

      plus.onclick = () => {
        let v = parseInt(count.textContent);
        v++;
        count.textContent = v;
        history[date][name] = v;
        saveHistory();
      };

      row.appendChild(left);
      row.appendChild(minus);
      row.appendChild(count);
      row.appendChild(plus);

      list.appendChild(row);
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

// 返回首页
document.getElementById("backHome").onclick = () => {
  document.getElementById("page-history").classList.remove("active");
  document.getElementById("page-home").classList.add("active");
};

// 跳转到统计页
document.getElementById("gotoStats").onclick = () => {
  window.location.href = "statistics.html";
};
