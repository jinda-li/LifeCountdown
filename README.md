# 今日最年轻 · Youngest

一个为手机设计的生命倒计时与每日回顾应用。

**今天，是你余生里最年轻的一天。**

打开线上版：

- GitHub Pages：https://jinda-li.github.io/LifeCountdown/
- jsDelivr 镜像（Pages 打不开时用）：https://cdn.jsdelivr.net/gh/jinda-li/LifeCountdown@gh-pages/index.html

## 它做什么

- 首次进入：输入出生地与出生年月日，按联合国 2023 年当地预期寿命估算余生
- 主页：实时生命倒计时（小时 / 分 / 秒）
- 每日回顾：晚上提醒「你今天又过去了一天」，写下今天做了什么
- 日历日记：回看以前写过的日子
- 人生要做的事：多块清单，设定目标和日期，鼓励尽早完成
- 颜色格子：用周/年格子看见已经走过和尚未到来的时间
- 自选「还剩什么」：吃饭、日出、旅行、周末、拥抱……
- 奖励：每天记录可获得「晨光」，解锁电池、时钟、点点格子、进度条、年轮等皮肤

数据只保存在你的浏览器本地，不会上传。

## 本地运行

```bash
npm install
npm run dev
```

## 设计

简约、留白、接近苹果软件的分组列表与底部 Tab。配色偏暖纸与日出，提醒珍惜，而不是恐吓。数字跳动使用 [21st.dev / Magic UI Number Ticker](https://21st.dev/community/components/magicui/number-ticker) 的思路实现。

预期寿命数据整理自联合国 DESA 2023 年出生时预期寿命（分性别）。这是统计估算，不是个人健康预测。
