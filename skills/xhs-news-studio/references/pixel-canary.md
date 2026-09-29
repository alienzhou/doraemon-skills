# 已认可案例：Pixel Canary

这是 2026-09-29 的历史制作案例。**所有名字、成绩、身份、免费状态与日期都是当时素材；不能当作新选题的当前事实。** 使用本文件学习组织与视觉，不复用事实。

## 查看与复现

- [整套预览](../assets/cases/pixel-canary/overview.png)
- [最终封面 A](../assets/cases/pixel-canary/01-cover.png)
- [手机缩略图](../assets/cases/pixel-canary/cover-thumbnails.png)
- [评测页](../assets/cases/pixel-canary/03-benchmark.png)
- [社区页](../assets/cases/pixel-canary/04-community.png)
- 完整可编辑原稿在 `assets/cases/pixel-canary/source/`：`build.cjs`、`style.css`、渲染/检查脚本、两张生成素材、文案与来源。没有保留依赖、临时抓取、账号数据、PDF 原报告或旧 ZIP。
- 需精确复现时复制整个 source 到新临时目录，`npm ci && npm run build && npm run render && npm run verify`；原稿渲染默认使用 macOS Chrome，其他平台设置 `CHROME_PATH`。不可在案例原目录覆写内容。

另有 `assets/cases/pixel-canary/starter-example.json`：用通用骨架复现历史资料的回归夹具（不是原版式，也不作为新认可案例）。将它复制为测试项目的 story.json，并从 source/assets 复制 canary-hero.png 到该项目 assets/ 可复现。仅供测试，不作为新稿默认输入。

## 为什么最后成立

| 问题 | 早期做法 | 用户反馈后的成品规则 |
|---|---|---|
| 新闻与效果混在一起 | 评测页主要画耗时，慢的条最长 | 效果页只突出任务通过率；体验问题后置 |
| 社区样本窄 | 三条反馈都说慢 | SQL 调试、3D 页面、3D 造型的具体结果，然后补中断 |
| 解释太重 | 反馈末尾再加大段“不足判断”框 | 删除整块，必要范围说明留给来源与页脚 |
| 模型名不突出 | 模型名 46px，上线结论 103px | 模型名最大，上线消息用明显标签 |
| 封面吸引力不足 | “开发方未公开”做主要看点 | “新模型上线 + Pixel Canary + 超过 GPT-6？”；内页回答该项评测持平 |
| 机器翻译会错 | 二手摘要把 bespoke suit 译成太空服 | 核对原视频字幕后写成西装；不能复制自动摘要的细节 |

## 实际结构

封面 + 上线介绍 + Next.js 通过率 + 社区实测 + 身份线索。共五张，另有未选封面 B。新闻性/效果/归属是当时话题的重点；下次不强制五张或身份结尾。

视觉关系：深色主视觉封面与奶油色内页；黄为注意色，绿灰为辅助色；标题与正文对比强；数据优先图示；来源弱化但可读。画面里的金丝雀是这个主题的意象，不是本技能固定 IP。

## 本案例的边界

代码质量得分不代表全部任务能力；字幕与帖子未由作者本人以外复现。问号封面配有直接答案，不能只抄问句而删除答案。素材为本次 AI 概念插画，不是官方标识或实测截图。
