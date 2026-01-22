const WORKOUT_GROUPS = {
  "背部": [
    { name: { zh: "对握下拉", hk: "對握下拉", en: "Neutral Grip Pulldown" }, reps: 10 },
    { name: { zh: "引体向上", hk: "引體向上", en: "Pull Up" }, reps: 8 },
    { name: { zh: "高位下拉", hk: "高位下拉", en: "Lat Pulldown" }, reps: 10 },
    { name: { zh: "坐姿划船", hk: "坐姿划船", en: "Seated Row" }, reps: 12 }
  ],

  "胸部": [
    { name: { zh: "卧推", hk: "臥推", en: "Bench Press" }, reps: 12 },
    { name: { zh: "上斜卧推", hk: "上斜臥推", en: "Incline Bench Press" }, reps: 12 },
    { name: { zh: "哑铃飞鸟", hk: "啞鈴飛鳥", en: "Dumbbell Fly" }, reps: 15 },
    { name: { zh: "拉绳夹胸", hk: "拉繩夾胸", en: "Cable Crossover" }, reps: 15 }
  ],

  "腿部": [
    { name: { zh: "深蹲", hk: "深蹲", en: "Squat" }, reps: 12 },
    { name: { zh: "硬拉", hk: "硬拉", en: "Deadlift" }, reps: 5 },
    { name: { zh: "腿举", hk: "腿舉", en: "Leg Press" }, reps: 15 },
    { name: { zh: "弓步蹲", hk: "弓步蹲", en: "Lunge" }, reps: 12 },
    { name: { zh: "小腿提踵", hk: "小腿提踵", en: "Calf Raise" }, reps: 20 }
  ],

  "肩部": [
    { name: { zh: "哑铃推举", hk: "啞鈴推舉", en: "Dumbbell Shoulder Press" }, reps: 10 },
    { name: { zh: "杠铃推举", hk: "槓鈴推舉", en: "Barbell Shoulder Press" }, reps: 8 },
    { name: { zh: "侧平举", hk: "側平舉", en: "Lateral Raise" }, reps: 15 },
    { name: { zh: "前平举", hk: "前平舉", en: "Front Raise" }, reps: 12 },
    { name: { zh: "反向飞鸟", hk: "反向飛鳥", en: "Reverse Fly" }, reps: 12 }
  ],

  "手臂": [
    { name: { zh: "哑铃弯举", hk: "啞鈴彎舉", en: "Dumbbell Curl" }, reps: 12 },
    { name: { zh: "杠铃弯举", hk: "槓鈴彎舉", en: "Barbell Curl" }, reps: 10 },
    { name: { zh: "锤式弯举", hk: "錘式彎舉", en: "Hammer Curl" }, reps: 12 },
    { name: { zh: "绳索下压", hk: "繩索下壓", en: "Cable Pushdown" }, reps: 12 },
    { name: { zh: "臂屈伸", hk: "臂屈伸", en: "Tricep Extension" }, reps: 10 }
  ],

  "核心": [
    { name: { zh: "卷腹", hk: "捲腹", en: "Crunch" }, reps: 20 },
    { name: { zh: "仰卧起坐", hk: "仰臥起坐", en: "Sit Up" }, reps: 20 },
    { name: { zh: "俄式转体", hk: "俄式轉體", en: "Russian Twist" }, reps: 20 },
    { name: { zh: "抬腿", hk: "抬腿", en: "Leg Raise" }, reps: 15 },
    { name: { zh: "平板支撑", hk: "平板支撐", en: "Plank" }, reps: 60 }
  ]
};
