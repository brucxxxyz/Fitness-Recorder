// app.js — B 版本（正确布局 + 组数显示 + 删除当天数据）

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

// 渲染子项目（动作列表）
function renderSubItems() {
  const part = bodyPartSelect.value;
  const container = document.getElementById("subItemContainer");
  container.innerHTML = "";

  WORKOUT_GROUPS[part].forEach(item => {
    const row = document.createElement("div");
    row.className = "subitem-row";

    const name = document.createElement("span");
    name.textContent = item.name;

    const minus = document.createElement("button");
    minus.className = "counter-btn";
    minus.textContent = "-";

    const count = document.createElement("span");
    count.className = "count-number";
    count.textContent = "0";

    const plus = document.createElement("button");
    plus.className = "counter-btn";
    plus.textContent = "+";

    minus.onclick = () => {
      let v = parseInt(count.textContent);
      if (v > 0) v--;
      count.textContent = v;
    };

    plus.onclick = () => {
      let v = parseInt(count.textContent);
      v++;
      count.textContent = v;
    };

    row.appendChild(name);
    row.appendChild(minus);
    row.appendChild(count);
    row.appendChild(plus);

    container.appendChild(row);
  });
}

// 切换部位时刷新动作列表
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
    const sets = parseInt(row.children[2].textContent);

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
      row.className = "history-row";

      const left = document.createElement("span");
      left.textContent = name;

      const right = document.createElement("span");
      right.textContent = items[name] + " 组";

      row.appendChild(left);
      row.appendChild(right);
      list.appendChild(row);
    }

    // ★ 恢复删除当天数据按钮
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
