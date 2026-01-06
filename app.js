document.addEventListener("DOMContentLoaded", () => {

  const STORAGE_KEY = "fitness_history_v13";
  let history = {};

  const datePicker = document.getElementById("datePicker");
  const bodyPartSelect = document.getElementById("bodyPartSelect");
  const selectBox = document.getElementById("selectBox");
  const subItemContainer = document.getElementById("subItemContainer");

  const gotoHistory = document.getElementById("gotoHistory");
  const backHome = document.getElementById("backHome");
  const gotoStats = document.getElementById("gotoStats");
  const historyList = document.getElementById("historyList");

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

  function updateSelectLabel() {
    const text = bodyPartSelect.options[bodyPartSelect.selectedIndex].text;
    selectBox.setAttribute("data-value", text);
  }

  function renderSubItems() {
    const part = bodyPartSelect.value;
    const items = WORKOUT_GROUPS[part];
    const dateKey = getDateKey();

    subItemContainer.innerHTML = "";

    items.forEach(obj => {
      const item = obj.name;
      const reps = obj.reps;
      const count = history[dateKey]?.[item] ?? 0;
      const total = reps * count;

      const row = document.createElement("div");
      row.className = "subitem-row";

      const left = document.createElement("div");
      left.textContent = `${item}   ${reps}次 × ${count}组 = ${total}次`;

      const right = document.createElement("div");
      right.className = "btn-row";

      const sub = document.createElement("button");
      sub.className = "counter-btn";
      sub.textContent = "-";
      sub.onclick = () => adjustItem(item, -1);

      const countLabel = document.createElement("span");
      countLabel.style.margin = "0 6px";
      countLabel.textContent = count;

      const add = document.createElement("button");
      add.className = "counter-btn";
      add.textContent = "+";
      add.onclick = () => adjustItem(item, +1);

      right.appendChild(sub);
      right.appendChild(countLabel);
      right.appendChild(add);

      row.appendChild(left);
      row.appendChild(right);
      subItemContainer.appendChild(row);
    });
  }

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
      
// 清除当天按钮
const clearBtn = document.createElement("button");
clearBtn.textContent = "清除当天数据";
clearBtn.className = "small-btn";
clearBtn.style.marginBottom = "10px";

clearBtn.onclick = () => {
  delete history[dateKey];
  saveStorage();
  renderHistoryPage();
};

card.appendChild(clearBtn);

      const items = history[dateKey];

      Object.keys(items).forEach(item => {
        const count = items[item];
        const reps = findReps(item);
        const total = reps * count;

        const row = document.createElement("div");
        row.className = "history-row history-item";

        const left = document.createElement("div");
        left.textContent = `${item}  ${reps}次 × ${count}组 = ${total}次`;

        const right = document.createElement("div");
        right.className = "btn-row";

        const sub = document.createElement("button");
        sub.className = "counter-btn";
        sub.textContent = "-";
        sub.onclick = () => adjustHistoryItem(dateKey, item, -1);

        const add = document.createElement("button");
        add.className = "counter-btn";
        add.textContent = "+";
        add.onclick = () => adjustHistoryItem(dateKey, item, +1);

        right.appendChild(sub);
        right.appendChild(add);

        row.appendChild(left);
        row.appendChild(right);
        card.appendChild(row);
      });

      historyList.appendChild(card);
    });
  }

  function findReps(itemName) {
    for (const part in WORKOUT_GROUPS) {
      for (const obj of WORKOUT_GROUPS[part]) {
        if (obj.name === itemName) return obj.reps;
      }
    }
    return 0;
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

  gotoStats.onclick = () => {
    window.location.href = "statistics.html";
  };

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