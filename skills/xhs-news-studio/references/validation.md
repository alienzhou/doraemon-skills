# 本次验证记录

日期：2026-09-29。环境：macOS、Node.js 22、Chrome、Python 3。验证在 /tmp 独立目录进行，没有覆盖用户原图文，也没有发布任何内容。

## 已执行

| 验证 | 观察结果 |
|---|---|
| skill-creator quick_validate.py | frontmatter、命名、正文检查通过 |
| 相对 Markdown 链接 | 全部目标存在 |
| 全局/仓库两处软链 | 均解析到 doraemon-skills/skills/xhs-news-studio |
| 从全局软链运行 scaffold.py | 模板资源正确复制；第二次对同一目录运行会拒绝覆盖 |
| 全新项目 npm install → build → render | 虚构样例生成 5 页 PNG、全套预览和缩略图；QA 通过 |
| 历史案例 starter-example.json | 用骨架重新生成五页；查看完整评测页和全套缩略图，标题、通过数、柱形长度、来源可读 |
| 正式稿打包路径 | 5 张 PNG + 文案 + 来源，ZIP 逐项内容与文件一致 |
| 发布 draft 示例 | 拒绝打包 |
| 通过率超过图轴上限 | build 拒绝 |
| 未声明的来源 ID | build 拒绝 |
| 缺失封面素材 | build 拒绝 |
| 问句指向不存在的答案页 | build 拒绝 |
| 修改 CSS 后直接打包 | 哈希检查拒绝陈旧渲染 |
| 替换 PNG 后直接打包 | 哈希检查拒绝陈旧/被替换图片 |
| light 配色 + 0% 条形图 | 五页渲染通过；查看完整图，0 值没有被边框画出假长度；封面可单独设置明暗文字 |
| 超长不可换行标题 | render 返回失败，报告 Overflow 和 Text outside canvas |

## 复现入口

常规 smoke：按 production.md 初始化全新目录，npm install、build、render；默认数据明确为虚构。

历史回归：将 `assets/cases/pixel-canary/starter-example.json` 复制为新项目 story.json；将 `assets/cases/pixel-canary/source/assets/canary-hero.png` 复制到新项目 assets/；运行 build/render。查看图片，写真实审阅记录，再运行 package。历史夹具不属于可直接发布的最新新闻。

故障检查在独立副本修改字段/文件，核对预期非零退出与具体原因；不修改参考原稿。生成物无需放入技能源目录。

## 未验证的范围

未单独切换低档模型做盲测或模型间质量对照；未验证 Windows/Linux 的字体和浏览器效果；night 仅提供配色起点，未单独完成视觉验收；未在小红书平台上传验证裁切与压缩。工具检查不证明内容语义一致或事实真实。例如把 90% 改成 0% 的边界夹具，会通过几何检查，仍须编辑审查发现与标题不符。

该技能通过详细决策规则、成熟案例和确定性脚本减少对单次设计能力的依赖，不能因此承诺任何模型都达到同样质量。
