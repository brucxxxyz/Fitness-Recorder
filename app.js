document.addEventListener("DOMContentLoaded", () => {

  const WORKOUTS = {
    "对握下拉": 10,
    "卧推": 8,
    "深蹲": 12,
    "硬拉": 5,
    "哑铃弯举": 12,
  };

  const STORAGE_KEY = "fitness_history_v8";
  let history = {};
  let currentCount = 0;

  const datePicker = document.getElementById("datePicker");
  const workoutSelect = document.getElementById("workoutSelect");
  const selectBox = document.getElementById("selectBox");

  const currentItemLabel = document.getElementById("currentItemLabel");
  const countLabel = document.getElementById("countLabel");
  const totalLabel = document.getElementById("totalLabel");

  const addBtn = document.getElementById("addBtn");
  const subBtn = document.getElementById("subBtn");
  const deleteItemBtn = document.getElementById("deleteItemBtn");
  const clearTodayBtn = document.getElementById("clearTodayBtn");

  const gotoHistory = document.getElementById("gotoHistory");
  const backHome = document.getElementById("backHome");
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

  /* 让 select 文本居中显示 */
  function updateSelectLabel() {
    const text = workoutSelect.options[workoutSelect.selectedIndex].text;
    selectBox.setAttribute("data-value", text);
    currentItemLabel.textContent = "当前记录：" + text;
  }

  function updateDisplay() {
    const item = workoutSelect.value;
    const per = WORKOUTS[item];
    countLabel.textContent = `组数：${currentCount}`;
    totalLabel.textContent = `总计：${currentCount * per} 个`;
  }

  function loadCurrent() {
    const dateKey = getDateKey();
    const item = workoutSelect.value;
    currentCount = history[dateKey]?.[item] ?? 0;
    updateDisplay();
    deleteItemBtn.style.display = currentCount > 0 ? "block" : "none";
    updateSelectLabel();
  }

  function saveCurrent() {
    const dateKey = getDateKey();
    const item = workoutSelect.value;

    if (!history[dateKey]) history[dateKey] = {};

    if (currentCount === 0) {
      delete history[dateKey][item];
      if (Object.keys(history[dateKey]).length === 0) delete history[dateKey];
      saveStorage();
      deleteItemBtn.style.display = "none";
      return;
    }

    history[dateKey][item] = currentCount;
    saveStorage();
    deleteItemBtn.style.display = "block";
  }

  deleteItemBtn.onclick = () => {
    const dateKey = getDateKey();
    const item = workoutSelect.value;
    if (history[dateKey]) {
      delete history[dateKey][item];
      if (Object.keys(history[dateKey]).length === 0) delete history[dateKey];
    }
    saveStorage();
    currentCount = 0;
    updateDisplay();
    deleteItemBtn.style.display = "none";
  };

  clearTodayBtn.onclick = () => {
    const dateKey = getDateKey();
    delete history[dateKey];
    saveStorage();
    currentCount = 0;
    updateDisplay();
    deleteItemBtn.style.display = "none";
  };

  addBtn.onclick = () => {
    currentCount++;
    updateDisplay();
    saveCurrent();
  };

  subBtn.onclick = () => {
    if (currentCount > 0) currentCount--;
    updateDisplay();
    saveCurrent();
  };

  datePicker.onchange = loadCurrent;
  workoutSelect.onchange = loadCurrent;

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
        const per = WORKOUTS[item];
        const count = items[item];

        const row = document.createElement("div");
        row.className = "row-space history-item";

        const left = document.createElement("div");
        left.textContent = `${item}：${count} 组（${count * per} 个）`;

        const right = document.createElement("div");
        right.className = "row";
        right.style.marginLeft = "auto";

        const sub = document.createElement("button");
        sub.className = "counter-btn";
        sub.textContent = "-";
        sub.onclick = () => {
          if (history[dateKey][item] > 0) history[dateKey][item]--;
          if (history[dateKey][item] === 0) delete history[dateKey][item];
          if (Object.keys(history[dateKey]).length === 0) delete history[dateKey];
          saveStorage();
          renderHistoryPage();
        };

        const add = document.createElement("button");
        add.className = "counter-btn";
        add.textContent = "+";
        add.onclick = () => {
          history[dateKey][item]++;
          saveStorage();
          renderHistoryPage();
        };

        right.appendChild(sub);
        right.appendChild(add);

        row.appendChild(left);
        row.appendChild(right);
        card.appendChild(row);
      });

      const delBtn = document.createElement("button");
      delBtn.className = "danger small";
      delBtn.style.marginTop = "10px";
      delBtn.textContent = "删除当天记录";
      delBtn.onclick = () => {
        delete history[dateKey];
        saveStorage();
        renderHistoryPage();
      };

      card.appendChild(delBtn);
      historyList.appendChild(card);
    });
  }

  gotoHistory.onclick = () => {
    renderHistoryPage();
    document.getElementById("page-home").classList.remove("active");
    document.getElementById("page-history").classList.add("active");
  };

  backHome.onclick = () => {
    document.getElementById("page-history").classList.remove("active");
    document.getElementById("page-home").classList.add("active");
  };

  loadStorage();

  Object.keys(WORKOUTS).forEach(item => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = item;
    workoutSelect.appendChild(opt);
  });

  datePicker.value = todayStr();
  loadCurrent();
});
