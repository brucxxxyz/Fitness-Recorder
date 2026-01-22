// workouts.js
// ===============================
// 三语言训练动作数据库
// 简体 / 繁体 / 英文
// ===============================

/* --------------------------------
   部位名称翻译
-------------------------------- */
const PART_TRANSLATION = {
  "背部": { zh: "背部", hk: "背部", en: "Back" },
  "胸部": { zh: "胸部", hk: "胸部", en: "Chest" },
  "腿部": { zh: "腿部", hk: "腿部", en: "Legs" },
  "肩部": { zh: "肩部", hk: "肩部", en: "Shoulders" },
  "手臂": { zh: "手臂", hk: "手臂", en: "Arms" },
  "核心": { zh: "核心", hk: "核心", en: "Core" }
};

/* --------------------------------
   动作名称翻译
-------------------------------- */
const WORKOUT_TRANSLATION = {
  "对握下拉": { zh: "对握下拉", hk: "對握下拉", en: "Neutral Grip Lat Pulldown" },
  "引体向上": { zh: "引体向上", hk: "引體向上", en: "Pull-up" },
  "高位下拉": { zh: "高位下拉", hk: "高位下拉", en: "Lat Pulldown" },
  "坐姿划船": { zh: "坐姿划船", hk: "坐姿划船", en: "Seated Row" },

  "卧推": { zh: "卧推", hk: "臥推", en: "Bench Press" },
  "上斜卧推": { zh: "上斜卧推", hk: "上斜臥推", en: "Incline Bench Press" },
  "哑铃飞鸟": { zh: "哑铃飞鸟", hk: "啞鈴飛鳥", en: "Dumbbell Fly" },
  "拉绳夹胸": { zh: "拉绳夹胸", hk: "拉繩夾胸", en: "Cable Chest Fly" },

  "深蹲": { zh: "深蹲", hk: "深蹲", en: "Squat" },
  "硬拉": { zh: "硬拉", hk: "硬拉", en: "Deadlift" },
  "腿举": { zh: "腿举", hk: "腿舉", en: "Leg Press" },
  "弓步蹲": { zh: "弓步蹲", hk: "弓步蹲", en: "Lunge" },
  "小腿提踵": { zh: "小腿提踵", hk: "小腿提踵", en: "Calf Raise" },

  "哑铃推举": { zh: "哑铃推举", hk: "啞鈴推舉", en: "Dumbbell Shoulder Press" },
  "杠铃推举": { zh: "杠铃推举", hk: "槓鈴推舉", en: "Barbell Shoulder Press" },
  "侧平举": { zh: "侧平举", hk: "側平舉", en: "Lateral Raise" },
  "前平举": { zh: "前平举", hk: "前平舉", en: "Front Raise" },
  "反向飞鸟": { zh: "反向飞鸟", hk: "反向飛鳥", en: "Reverse Fly" },

  "哑铃弯举": { zh: "哑铃弯举", hk: "啞鈴彎舉", en: "Dumbbell Curl" },
  "杠铃弯举": { zh: "杠铃弯举", hk: "槓鈴彎舉", en: "Barbell Curl" },
  "锤式弯举": { zh: "锤式弯举", hk: "錘式彎舉", en: "Hammer Curl" },
  "绳索下压": { zh: "绳索下压", hk: "繩索下壓", en: "Cable Pushdown" },
  "臂屈伸": { zh: "臂屈伸", hk: "臂屈伸", en: "Triceps Extension" },

  "卷腹": { zh: "卷腹", hk: "捲腹", en: "Crunch" },
  "仰卧起坐": { zh: "仰卧起坐", hk: "仰臥起坐", en: "Sit-up" },
  "俄式转体": { zh: "俄式转体", hk: "俄式轉體", en: "Russian Twist" },
  "抬腿": { zh: "抬腿", hk: "抬腿", en: "Leg Raise" },
  "平板支撑": { zh: "平板支撑", hk: "平板支撐", en: "Plank" }
};

/* --------------------------------
   原始训练数据（简体中文）
-------------------------------- */
const WORKOUT_GROUPS = {
  "背部": [
    { name: "对握下拉", reps: 10 },
    { name: "引体向上", reps: 8 },
    { name: "高位下拉", reps: 10 },
    { name: "坐姿划船", reps: 12 }
  ],

  "胸部": [
    { name: "卧推", reps: 12 },
    { name: "上斜卧推", reps: 12 },
    { name: "哑铃飞鸟", reps: 15 },
    { name: "拉绳夹胸", reps: 15 }
  ],

  "腿部": [
    { name: "深蹲", reps: 12 },
    { name: "硬拉", reps: 5 },
    { name: "腿举", reps: 15 },
    { name: "弓步蹲", reps: 12 },
    { name: "小腿提踵", reps: 20 }
  ],

  "肩部": [
    { name: "哑铃推举", reps: 10 },
    { name: "杠铃推举", reps: 8 },
    { name: "侧平举", reps: 15 },
    { name: "前平举", reps: 12 },
    { name: "反向飞鸟", reps: 12 }
  ],

  "手臂": [
    { name: "哑铃弯举", reps: 12 },
    { name: "杠铃弯举", reps: 10 },
    { name: "锤式弯举", reps: 12 },
    { name: "绳索下压", reps: 12 },
    { name: "臂屈伸", reps: 10 }
  ],

  "核心": [
    { name: "卷腹", reps: 20 },
    { name: "仰卧起坐", reps: 20 },
    { name: "俄式转体", reps: 20 },
    { name: "抬腿", reps: 15 },
    { name: "平板支撑", reps: 60 }
  ]
};

/* --------------------------------
   工具函数：获取翻译
-------------------------------- */
function translatePart(part, lang) {
  return PART_TRANSLATION[part]?.[lang] || part;
}

function translateWorkout(name, lang) {
  return WORKOUT_TRANSLATION[name]?.[lang] || name;
}

/* --------------------------------
   六维能力映射（用于雷达图）
-------------------------------- */
// balance / power / endurance / flexibility / stability / coordination
const WORKOUT_DIMENSION_MAP = {
  // 背部
  "对握下拉": "power",
  "引体向上": "power",
  "高位下拉": "power",
  "坐姿划船": "coordination",

  // 胸部
  "卧推": "power",
  "上斜卧推": "power",
  "哑铃飞鸟": "flexibility",
  "拉绳夹胸": "flexibility",

  // 腿部
  "深蹲": "power",
  "硬拉": "power",
  "腿举": "endurance",
  "弓步蹲": "balance",
  "小腿提踵": "endurance",

  // 肩部
  "哑铃推举": "power",
  "杠铃推举": "power",
  "侧平举": "stability",
  "前平举": "stability",
  "反向飞鸟": "coordination",

  // 手臂
  "哑铃弯举": "coordination",
  "杠铃弯举": "power",
  "锤式弯举": "power",
  "绳索下压": "endurance",
  "臂屈伸": "endurance",

  // 核心
  "卷腹": "endurance",
  "仰卧起坐": "endurance",
  "俄式转体": "balance",
  "抬腿": "endurance",
  "平板支撑": "stability"
};
