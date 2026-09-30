# DevDay 2026 · 25项发布对应18张图

含封面总计18张，完整性以[官方回顾](https://openai.com/index/devday-2026-recap/)的25个产品主题为基准。各主题均出现在正文图片；近邻主题合页，模型评测单独展开。

| ID | 官方主题 | 图文页码 | 主要来源 |
|---|---|---|---|
| D01 | Dots | 2 | S1, S2 |
| D02 | GPT-6.1 Sol | 3, 4 | S1, S4, S5, S27 |
| D03 | Ultrafast | 5 | S1, S6, S26 |
| D04 | Private Intelligence | 6 | S1, S7 |
| D05 | Codex in the cloud | 7 | S1, S8 |
| D06 | A refreshed Codex CLI | 7 | S1, S9 |
| D07 | Code Review | 8 | S1, S10 |
| D08 | Codex Security Cloud | 8 | S1, S11 |
| D09 | Decisions API | 9 | S1 |
| D10 | Agents API with Computer use | 9 | S1, S29 |
| D11 | Bedrock Managed Agents, powered by OpenAI | 10 | S1, S12 |
| D12 | Plugin extensions | 11 | S1, S13 |
| D13 | Improved plugin creation, submission, and discovery | 11 | S1, S14 |
| D14 | Sites can now host plugins | 12 | S1, S15 |
| D15 | MCP events for plugin automations | 12 | S1, S16 |
| D16 | ChatGPT Space | 13 | S1, S17 |
| D17 | Pages | 13 | S1, S17 |
| D18 | Collaborative slides | 14 | S1, S17 |
| D19 | Create teams and share tasks | 15 | S1, S18 |
| D20 | @ChatGPT in Slack and Microsoft Teams | 15 | S1, S19 |
| D21 | Meetings plugin | 16 | S1, S20 |
| D22 | Shareable profiles | 17 | S1, S21 |
| D23 | Sign in with ChatGPT | 17 | S1, S22, S23 |
| D24 | A new Pro tier | 5 | S1, S24 |
| D25 | OpenAI Marketplace | 18 | S1, S25 |

## 各页补充条件

### 第2张 · Dots 持续工作的 AI 伙伴

- 云端电脑与浏览器可处理多个项目；用户可授权连接自己的电脑。
- 专用 Dots 使用独立身份、凭据和职责，企业试点与 Microsoft Agent 365 集成。
- 主动研究可读获准来源并保存私有笔记；不发消息、不改应用内容、不操作浏览器和电脑。Auto-review 按用户指令、Custom Rules 和安全要求审阅动作，改密码等敏感步骤交给用户。
- 首个 dot 随 Pro / Business Premium 包含；对话不占 ChatGPT 用量，委派 Work / Codex 任务按正常规则计量；深度工作另有额度，首月提高。企业 Beta 默认关闭。

### 第3张 · GPT-6.1 Sol 能力与单价一起看

- 缓存输入 $0.10、缓存写入 $2.50 / 百万 token；长输入、工具、地域及其他服务档位另计。
- Work / Codex：Plus、Pro、Business、Enterprise、Edu；支持 low–max reasoning，接工具使用 Responses API。

### 第4张 · Sol 的提升 落在哪些任务上？

- DeepSWE v1.1 达到 Astra 成绩、约 1/5 任务成本，比原 Sol 最佳成绩高 6.4 个百分点。
- GDP.pdf 高于带 fallbacks 的 Opus 5.5、成本低于一半；接近 Astra 成绩、约 1/5 成本。
- AutomationBench medium：比 Opus 5.5 高 2.2 个百分点、约 1/3 成本；比原 Sol 同设置高 4.8 个百分点。
- OSWorld 2.0 offline v2026.08.08、max effort：比 Sol 高 7 个百分点，距 Astra 2.1 个百分点、约 1/7 成本。
- Terminal-Bench Science 0.1、max effort：成绩超过 Sol 两倍，平均每任务 $5.47；Opus 5.5 $23.21，Astra $23.80，Astra 成绩仍最高。
- 事实性 low effort 的错误回答占比由 11.4% 降至 7.7%，提示来自用户曾标记错误的对话，不能套用于典型工作。
- 透明披露限制、遵守明确要求等对齐挑战测试改善；挑战失败率也不能直接推断日常故障率。

### 第5张 · Ultrafast + Pro 500 更快输出，更高额度

- 大会官方回顾写 Codex 最高 8×、300 token/s，API 最高 6×；动态 API 文档另写最高 8×，图片沿用大会口径。token 输出倍数不能保证整项任务耗时同比缩短。
- Astra：API 可用；Work / Codex 面向 Pro 500 与合资格 Enterprise / Edu，按权限、地域开放。
- Astra 订阅额度按 Standard 的 8× 消耗；购买 credits / 企业按量账单按 6×，另依合同。
- Pro 100 / 200 / 500 月费分别 $100 / $200 / $500；100 和 200 不包含 Ultrafast。
- Pro 200 重开后，非 grandfathering 的新订阅额度降低；符合条件的既有用户保留原额度至 2026-10-29，之后降低，月费仍 $200，资格以账户通知为准。

### 第6张 · Private Intelligence 企业数据有两层防护

- Private Safety Processing 结合 ZDR 在受保护的运行时进行自动安全审阅。客户云端保留加密安全记录并控制权限和密钥，当前至少保留 30 天。
- Private Inference 结合 confidential computing 与可验证控制；大会尚未宣布普遍开放。接入资格和配置依官方指南。

### 第7张 · Codex 开发 跨设备接着做

- 云环境保存仓库、依赖、工具、网络与获准设置，每个任务拥有独立工作区；GitHub 与网络连接按项目权限配置。
- Cloud 大会列 Plus、Pro、Business、Healthcare、Education、Enterprise，具体访问依工作区。
- CLI 可语音发起及补充任务；/agents 委派和跟踪多个工作；提示编辑、恢复会话、worktree 与长会话显示改善，具体构建和快捷键依客户端版本。

### 第8张 · 审代码、查安全 电脑合盖也能继续

- Code Review 大会列所有计划，桌面个人 inbox、跨项目 review、review instructions；自动云端审查需要仓库连接和设置，审查结论应结合 diff 核验。
- Security Cloud 在桌面和网页可用，扫描 GitHub 仓库、持续监控新 commit、调查去重验证问题并排序；Fix with Codex 生成 patch，审查后再建 draft PR。云端插件与本地安全扫描是不同入口。

### 第9张 · API 多了 判断与执行两种能力

- Decisions API 提交文本或图像上下文，从开发者定义的有限答案判断；官网未给完整延迟/价格数字。
- Agents API 借助托管电脑/浏览器操作软件，并行子任务、工具检索/调用与上下文压缩纳入工作流；应用负责网站登录、账号授权、操作权限和结果核验。模型、工具与运行环境分别依用法计费。
- 大会另列 Work / Codex Computer use 面向 Pro 500 与 Enterprise；API 本身按 Beta 文档接入。

### 第10张 · 托管 Agent 也能完整运行在 AWS

- Bedrock Managed Agents, powered by OpenAI 由 AWS 与 OpenAI 联合开发，保留持续上下文、工具和专门 Agent 协调能力，用于多步长任务。
- 运行时与模型推理都在 AWS，使用既有计算和数据资源；每个 Agent 有 AWS 身份与明确权限，AgentCore 默认提供计算环境。当前为 Preview。

### 第11张 · 插件进入原生界面 制作与分发也更新

- 插件扩展可在侧栏打开全屏应用、与对话并排操作、展示支持的文件类型；另有设置和输入框扩展。大会列所有计划，但文档标 Free / Go 网页扩展 coming soon，mentions 仅桌面。
- Plugin Creator 辅助准备插件、工具和技能包；上传 ZIP 后获得更清楚的检查反馈，修正并审核后自行选择发布时间。目录排名和对话相关推荐改善；用户决定安装并批准每个插件访问。

### 第12张 · Sites + MCP Events 插件也能响应新事件

- Sites 可以托管受支持的 ChatGPT 插件；同事使用各自的数据连接与权限，无需共用作者个人账号，自动化更易添加管理。
- MCP Events 订阅新消息或内容更新，由 Webhook 通知触发用户预先设置的自动化，后台也可响应，后续操作仍按授权执行。MCP 2.0（2026-07-28）支持回调验证，当前集成不支持 polling / streaming。大会列所有计划。

### 第13张 · Space + Pages 人和 AI 在同一页工作

- Space 替代 Library，汇集 Pages、文件、幻灯片、表格等资料与成果，团队、ChatGPT 与 dot 使用共同上下文；可按指令持续整理和更新。
- Pages 包含文字、图片、图表、清单、原型和交互工具，多人实时编辑/评论，@ChatGPT 或 dot 继续处理；来源和更新指令可驱动动态维护。连接来源和页面分享各受自身权限限制。Space 与 Pages 面向 Pro / Business / Enterprise。
- 移动端目前可查找、阅读和分享，编辑即将推出。协作表格在 Space 页面亦标 coming soon，不另外计算为第26个发布主题。

### 第14张 · 协作幻灯片 团队与 Agent 同时做

- 大会宣布未来几周开放，尚未普遍可用。可由对话或自有模板生成，多个同事与 Agent 同时编辑、评论、反馈，在 ChatGPT 演示或导出 PowerPoint / Google Slides，官方称保持格式。

### 第15张 · 团队协作 聊天与共享任务更紧密

- 团队成员共享工作成果、维护任务指令；按日程或新邮件/Slack 消息等事件触发云端任务，使用团队 service account 与管理员配置的连接。创建管理权限、团队 credits 与限额单独控制。ChatGPT Teams 不是 Microsoft Teams，成员不自动同步。
- @ChatGPT 可在 Slack / Microsoft Teams 频道、线程、私聊把讨论转成计划、报告与后续工作，同事在同一对话补背景继续修订；使用管理员配置连接或个人另授权工具。无需人人个人 license，不自动继承个人账号、全部历史或权限。共享回复和源文件访问分别受权限约束。

### 第16张 · Meetings 开完会，接着推进工作

- macOS 桌面插件读取麦克风与系统音频，可记录线上线下会议，开始前须取得参与者同意。结合授权来源整理摘要与行动项，可审查后更新计划或准备跟进稿。
- 笔记默认私有，由用户决定分享。音频笔记处理就绪后删除，不可回放；离线待处理可能暂存。Enterprise 仅有限 alpha，其他系统和企业普遍支持即将推出。

### 第17张 · 作品可以分享 账号也能带到伙伴工具

- Profiles 网页/桌面 showcase 展示 Sites 与插件，主页可私有；手机暂无 showcase。技能仅工作区分享，个人主页不能公开分享技能。大会列 Free 至 Enterprise，帮助页 Enterprise profiles sharing coming soon。
- Identity 登录全球可用，与用量授权分开；Plus / Pro 为参与工具授权符合条件 AI 请求，按应用设置每周限额，请求计入原额度，不增加总量。credits 必须显式授权，第三方订阅或服务可另外收费，无需共享 OpenAI API Key。
- 16 个额度伙伴为 12 个商业工具（含尚 coming soon 的 Lovable）与 4 个开源集成，另有只使用身份登录的工具。

### 第18张 · OpenAI Marketplace 企业采购更灵活

- Marketplace 允许合资格企业把部分现有 OpenAI commitment 用于获准伙伴软件。首批 32 家伙伴覆盖创意、客户体验、法律、安全与开源模型；大会列 Figma、Adobe、Harvey、CrowdStrike 等。
- 企业向 OpenAI 与伙伴表达采购需求，依合同、产品与项目条款确认可抵用部分，不是通用消费券。Marketplace 与安装 ChatGPT 插件的目录是不同产品。

资料截止2026-09-30，事件日期按美国太平洋时间2026-09-29。