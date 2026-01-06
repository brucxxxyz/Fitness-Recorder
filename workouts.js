// workouts.js

const WORKOUT_GROUPS = {
  "背部": [
    { name: "对握下拉", reps: 10 },   // ← 放在第一个
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
    { name: "俄罗斯转体", reps: 20 },
    { name: "抬腿", reps: 15 },
    { name: "平板支撑", reps: 60 }
  ]
};
