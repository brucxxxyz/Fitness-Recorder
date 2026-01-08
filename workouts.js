// =========================
// 训练部位 & 动作名称（多语言）
// =========================

const WORKOUT_I18N = {
  zh: {
    back: "背部",
    chest: "胸部",
    legs: "腿部",
    shoulder: "肩部",
    arms: "手臂",
    core: "核心",

    // 动作
    "对握下拉": "对握下拉",
    "引体向上": "引体向上",
    "高位下拉": "高位下拉",
    "坐姿划船": "坐姿划船",

    "卧推": "卧推",
    "上斜卧推": "上斜卧推",
    "哑铃飞鸟": "哑铃飞鸟",
    "拉绳夹胸": "拉绳夹胸",

    "深蹲": "深蹲",
    "硬拉": "硬拉",
    "腿举": "腿举",
    "弓步蹲": "弓步蹲",
    "小腿提踵": "小腿提踵",

    "哑铃推举": "哑铃推举",
    "杠铃推举": "杠铃推举",
    "侧平举": "侧平举",
    "前平举": "前平举",
    "反向飞鸟": "反向飞鸟",

    "哑铃弯举": "哑铃弯举",
    "杠铃弯举": "杠铃弯举",
    "锤式弯举": "锤式弯举",
    "绳索下压": "绳索下压",
    "臂屈伸": "臂屈伸",

    "卷腹": "卷腹",
    "仰卧起坐": "仰卧起坐",
    "俄罗斯转体": "俄罗斯转体",
    "抬腿": "抬腿",
    "平板支撑": "平板支撑"
  },

  yue: {
    back: "背肌",
    chest: "胸肌",
    legs: "腿部",
    shoulder: "膊頭",
    arms: "手臂",
    core: "核心",

    "对握下拉": "對握下拉",
    "引体向上": "引體向上",
    "高位下拉": "高位下拉",
    "坐姿划船": "坐姿划船",

    "卧推": "卧推",
    "上斜卧推": "上斜卧推",
    "哑铃飞鸟": "啞鈴飛鳥",
    "拉绳夹胸": "拉繩夾胸",

    "深蹲": "深蹲",
    "硬拉": "硬拉",
    "腿举": "腿舉",
    "弓步蹲": "弓步蹲",
    "小腿提踵": "提踭",

    "哑铃推举": "啞鈴推舉",
    "杠铃推举": "槓鈴推舉",
    "侧平举": "側平舉",
    "前平举": "前平舉",
    "反向飞鸟": "反向飛鳥",

    "哑铃弯举": "啞鈴彎舉",
    "杠铃弯举": "槓鈴彎舉",
    "锤式弯举": "鎚式彎舉",
    "绳索下压": "繩索下壓",
    "臂屈伸": "臂屈伸",

    "卷腹": "卷腹",
    "仰卧起坐": "仰臥起坐",
    "俄罗斯转体": "俄羅斯轉體",
    "抬腿": "抬腿",
    "平板支撑": "平板支撐"
  },

  en: {
    back: "Back",
    chest: "Chest",
    legs: "Legs",
    shoulder: "Shoulder",
    arms: "Arms",
    core: "Core",

    "对握下拉": "Neutral Grip Pulldown",
    "引体向上": "Pull-up",
    "高位下拉": "Lat Pulldown",
    "坐姿划船": "Seated Row",

    "卧推": "Bench Press",
    "上斜卧推": "Incline Bench Press",
    "哑铃飞鸟": "Dumbbell Fly",
    "拉绳夹胸": "Cable Crossover",

    "深蹲": "Squat",
    "硬拉": "Deadlift",
    "腿举": "Leg Press",
    "弓步蹲": "Lunge",
    "小腿提踵": "Calf Raise",

    "哑铃推举": "Dumbbell Shoulder Press",
    "杠铃推举": "Barbell Shoulder Press",
    "侧平举": "Lateral Raise",
    "前平举": "Front Raise",
    "反向飞鸟": "Reverse Fly",

    "哑铃弯举": "Dumbbell Curl",
    "杠铃弯举": "Barbell Curl",
    "锤式弯举": "Hammer Curl",
    "绳索下压": "Cable Pushdown",
    "臂屈伸": "Tricep Extension",

    "卷腹": "Crunch",
    "仰卧起坐": "Sit-up",
    "俄罗斯转体": "Russian Twist",
    "抬腿": "Leg Raise",
    "平板支撑": "Plank"
  }
};

// =========================
// 原始训练数据（用于 reps）
// =========================

const WORKOUT_GROUPS = {
  back: [
    { name: "对握下拉", reps: 10 },
    { name: "引体向上", reps: 8 },
    { name: "高位下拉", reps: 10 },
    { name: "坐姿划船", reps: 12 }
  ],

  chest: [
    { name: "卧推", reps: 12 },
    { name: "上斜卧推", reps: 12 },
    { name: "哑铃飞鸟", reps: 15 },
    { name: "拉绳夹胸", reps: 15 }
  ],

  legs: [
    { name: "深蹲", reps: 12 },
    { name: "硬拉", reps: 5 },
    { name: "腿举", reps: 15 },
    { name: "弓步蹲", reps: 12 },
    { name: "小腿提踵", reps: 20 }
  ],

  shoulder: [
    { name: "哑铃推举", reps: 10 },
    { name: "杠铃推举", reps: 8 },
    { name: "侧平举", reps: 15 },
    { name: "前平举", reps: 12 },
    { name: "反向飞鸟", reps: 12 }
  ],

  arms: [
    { name: "哑铃弯举", reps: 12 },
    { name: "杠铃弯举", reps: 10 },
    { name: "锤式弯举", reps: 12 },
    { name: "绳索下压", reps: 12 },
    { name: "臂屈伸", reps: 10 }
  ],

  core: [
    { name: "卷腹", reps: 20 },
    { name: "仰卧起坐", reps: 20 },
    { name: "俄罗斯转体", reps: 20 },
    { name: "抬腿", reps: 15 },
    { name: "平板支撑", reps: 60 }
  ]
};
