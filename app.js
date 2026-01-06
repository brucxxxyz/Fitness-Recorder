document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------
     1. 数据结构
  ------------------------- */

  const WORKOUT_GROUPS = {
    "胸部": ["卧推", "上斜卧推", "哑铃飞鸟", "拉绳夹胸"],
    "背部": ["引体向上", "高位下拉", "对握下拉", "坐姿划船"],
    "腿部": ["深蹲", "硬拉", "腿举", "弓步蹲", "小腿提踵"],
    "肩部": ["哑铃推举", "杠铃推举", "侧平举", "前平举", "反向飞鸟"],
    "手臂": ["哑铃弯举", "杠铃弯举", "锤式弯举", "绳索下压", "臂屈伸"],
    "核心": ["卷腹", "仰卧起坐", "俄罗斯转体", "抬腿", "平板支撑"]
  };

  const STORAGE_KEY = "fitness_history_v10";
  let history = {};

  /* -------------------------
     2. DOM
  ------------------------- */

  const datePicker = document.getElementById("datePicker");
  const bodyPartSelect = document.getElementById("bodyPartSelect");
  const selectBox = document.getElementById("selectBox");
  const subItemContainer = document.getElementById("subItemContainer");

  const gotoHistory = document.getElementById("gotoHistory");
  const backHome = document.getElementById("backHome");
  const historyList = document.getElementById("historyList");

  /* -------------------------
     3. 工具函数
  ------------------------- */

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  const getDateKey = () => datePicker.value || todayStr();

  const loadStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) history = JSON.parse(raw);
  };

  const saveStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  };

  /* -------------------------
     4. 更新部位选择文字（居中）
  ------------------------- */

  function updateSelectLabel() {
    const text = bodyPartSelect.options[bodyPartSelect.selectedIndex].text;
    selectBox.setAttribute("data-value", text);
  }

  /* -------------------------
     5. 渲染子项目列表
  ------------------------- */

  function renderSubItems() {
    const part = bodyPartSelect.value;
    const items = WORKOUT_GROUPS[part];
    const dateKey = getDateKey();

    subItemContainer.innerHTML = "";

    items.forEach(item => {
      const count = history[dateKey]?.[item] ?? 0;

      const row = document.createElement("div");
      row.className = "subitem-row";

      const left = document.createElement("div");
      left.textContent = item;

      const right = document.createElement("div");
      right.className = "btn-row";

      const sub = document.createElement("button");
      sub.className = "counter-btn";
      sub.textContent = "-";
      sub.onclick = () => adjustItem(item, -1);

      const add = document.createElement("button");
      add.className = "counter-btn";
      add.textContent = "+";
      add.onclick = () => adjustItem(item, +1);

      const countLabel = document.createElement("span");
      countLabel.style.margin = "0 6px";
      countLabel.textContent = count;

      right.appendChild(sub);
      right.appendChild(countLabel);
      right.appendChild(add);

      row.appendChild(left);
      row.appendChild(right);
      subItemContainer.appendChild(row);
    });
  }

  /* -------------------------
     6. 调整项目组数
  ------------------------- */

  function adjustItem(item, delta) {
    const dateKey = getDateKey();
    if (!history[dateKey]) history[dateKey] = {};

    const newValue = (history[dateKey][item] ?? 0) + delta;

    if (newValue <= 0) {
      delete history[dateKey][item];
      if (Object.keys(history[dateKey]).length === 0) delete history[dateKey];
    } else {
      history[dateKey][item] = newValue;
    }

    saveStorage();
    renderSubItems();
  }

  /* -------------------------
     7. 历史记录页
  ------------------------- */

  function renderHistoryPage() {
    historyList.innerHTML = "";
    const dates = Object.keys(history).sort();

    if (dates.length === 0) {
      historyList.innerHTML = "<div class='card'>暂无记录</div>";
      return;
    }

    dates.forEach(dateKey => {
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.style.marginBottom = "6px";
      title.textContent = dateKey;
      card.appendChild(title);

      const items = history[dateKey];

      Object.keys(items).forEach(item => {
        const count = items[item];

        const row = document.createElement("div");
        row.className = "history-row history-item";

        const left = document.createElement("div");
        left.textContent = `${item}：${count} 组`;

        const right = document.createElement("div");
        right.className = "btn-row";

        const sub = document.createElement("button");
        sub.className = "counter-btn";
        sub.textContent = "-";
        sub.onclick = () => {
          adjustHistoryItem(dateKey, item, -1);
        };

        const add = document.createElement("button");
        add.className = "counter-btn";
        add.textContent = "+";
        add.onclick = () => {
          adjustHistoryItem(dateKey, item, +1);
        };

        right.appendChild(sub);
        right.appendChild(add);

        row.appendChild(left);
        row.appendChild(right);
        card.appendChild(row);
      });

      historyList.appendChild(card);
    });
  }

  function adjustHistoryItem(dateKey, item, delta) {
    const newValue = (history[dateKey][item] ?? 0) + delta;

    if (newValue <= 0) {
      delete history[dateKey][item];
      if (Object.keys(history[dateKey]).length === 0) delete history[dateKey];
    } else {
      history[dateKey][item] = newValue;
    }

    saveStorage();
    renderHistoryPage();
  }

  /* -------------------------
     8. 事件绑定
  ------------------------- */

  bodyPartSelect.onchange = () => {
    updateSelectLabel();
    renderSubItems();
  };

  datePicker.onchange = () => {
    renderSubItems();
  };

  gotoHistory.onclick = () => {
    renderHistoryPage();
    document.getElementById("page-home").classList.remove("active");
    document.getElementById("page-history").classList.add("active");
  };

  backHome.onclick = () => {
    document.getElementById("page-history").classList.remove("active");
    document.getElementById("page-home").classList.add("active");
  };

  /* -------------------------
     9. 初始化
  ------------------------- */

  loadStorage();

  Object.keys(WORKOUT_GROUPS).forEach(part => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = part;
    bodyPartSelect.appendChild(opt);
  });

  datePicker.value = todayStr();
  updateSelectLabel();
  renderSubItems();
});
