export type MetricId =
  | "weeks"
  | "sunrises"
  | "meals"
  | "weekends"
  | "seasons"
  | "birthdays"
  | "fullMoons"
  | "coffee"
  | "books"
  | "trips"
  | "movies"
  | "hugs"
  | "familyMeals"
  | "newYears"
  | "walks"
  | "songs";

export type MetricDef = {
  id: MetricId;
  name: string;
  unit: string;
  hint: string;
  perYear: number;
  defaultOn?: boolean;
  unlockAt: number;
  customizable?: boolean;
  min?: number;
  max?: number;
};

export const METRICS: MetricDef[] = [
  {
    id: "weeks",
    name: "还剩多少周",
    unit: "周",
    hint: "一周只有一次。",
    perYear: 365.2425 / 7,
    defaultOn: true,
    unlockAt: 0,
  },
  {
    id: "sunrises",
    name: "还能看多少次日出",
    unit: "次日出",
    hint: "每天清晨，世界会再亮一次。",
    perYear: 365.2425,
    defaultOn: true,
    unlockAt: 0,
  },
  {
    id: "meals",
    name: "还能吃多少顿饭",
    unit: "顿饭",
    hint: "按一日三餐估算，可在设置里改。",
    perYear: 365.2425 * 3,
    defaultOn: true,
    unlockAt: 0,
    customizable: true,
    min: 1,
    max: 6,
  },
  {
    id: "weekends",
    name: "还剩多少个周末",
    unit: "个周末",
    hint: "真正属于你的星期六。",
    perYear: 365.2425 / 7,
    unlockAt: 1,
  },
  {
    id: "seasons",
    name: "还能遇见多少个春天",
    unit: "个春天",
    hint: "花还会开，你也还在。",
    perYear: 1,
    unlockAt: 1,
  },
  {
    id: "birthdays",
    name: "还过多少次生日",
    unit: "次生日",
    hint: "蜡烛会越来越少，光不会。",
    perYear: 1,
    unlockAt: 0,
  },
  {
    id: "fullMoons",
    name: "还能看多少次满月",
    unit: "次满月",
    hint: "大约每 29.5 天，月亮会圆一次。",
    perYear: 12.368,
    unlockAt: 2,
  },
  {
    id: "coffee",
    name: "还能喝多少杯咖啡",
    unit: "杯",
    hint: "按每天一杯估算。",
    perYear: 365.2425,
    unlockAt: 3,
    customizable: true,
    min: 0,
    max: 5,
  },
  {
    id: "books",
    name: "还能读多少本书",
    unit: "本",
    hint: "默认一年 12 本，可改。",
    perYear: 12,
    unlockAt: 3,
    customizable: true,
    min: 1,
    max: 80,
  },
  {
    id: "trips",
    name: "还能出发多少次旅行",
    unit: "次旅行",
    hint: "默认一年两次出发。",
    perYear: 2,
    unlockAt: 5,
    customizable: true,
    min: 0.5,
    max: 24,
  },
  {
    id: "movies",
    name: "还能看多少场电影",
    unit: "场",
    hint: "一块屏幕，两小时的别人的人生。",
    perYear: 12,
    unlockAt: 5,
    customizable: true,
    min: 1,
    max: 80,
  },
  {
    id: "hugs",
    name: "还能给出去多少次拥抱",
    unit: "次拥抱",
    hint: "默认一周一次，请尽量超额完成。",
    perYear: 52,
    unlockAt: 7,
    customizable: true,
    min: 12,
    max: 365,
  },
  {
    id: "familyMeals",
    name: "还能和家人吃多少顿饭",
    unit: "顿",
    hint: "默认一周一次团圆。有空就提前。",
    perYear: 52,
    unlockAt: 7,
    customizable: true,
    min: 6,
    max: 365,
  },
  {
    id: "newYears",
    name: "还能跨过多少次新年",
    unit: "个新年",
    hint: "倒计时之外，还有倒计时。",
    perYear: 1,
    unlockAt: 2,
  },
  {
    id: "walks",
    name: "还能散多少次步",
    unit: "次散步",
    hint: "默认一年 150 次出门走走。",
    perYear: 150,
    unlockAt: 10,
    customizable: true,
    min: 20,
    max: 400,
  },
  {
    id: "songs",
    name: "还能听完多少首歌",
    unit: "首",
    hint: "按一年两千首估算。",
    perYear: 2000,
    unlockAt: 10,
  },
];

export const DEFAULT_METRICS: MetricId[] = ["weeks", "sunrises", "meals"];
