# 并行会话下的 checkpoint 归属设计

## 🔵 Current Focus
- 讨论已基本收敛：V1 闭环、helper 脚本形态、temp 目录、错误处理、patch 时间戳方案均已确认

## ⚪ Pending
- 将讨论结果沉淀为正式技术规格文档
- 进入实现与文档更新

## ✅ Confirmed
- 当前 checkpoint 机制是工作区级别，不是会话级别
- `platform/unix/checkpoint.sh` / `platform/win/checkpoint.ps1` 都直接执行 `git add -A`，会把所有未提交改动一起提交
- `check_uncommitted` hook 只基于工作区 `git status` 判断是否有改动，并不知道这些改动属于哪个会话
- 现有仓库里没有可直接复用的 `chatId` / `session` / `thread` 级编辑归属机制
- `skill/SKILL.md` 当前也明确要求 agent 调用脚本时走全量提交逻辑
- 目标粒度收敛到 hunk 级，比“行级归属”更现实
- fallback 与主动提交本质上可以共用同一条提交链路：先选 hunks，再执行 checkpoint
- patch 临时文件不应放在项目目录内，避免污染仓库工作区
- patch 临时文件应存放在 ABC 自己目录下的 `tmp/` 中
- temp 文件采用 TTL 清理策略即可，默认清理 24 小时或 48 小时之前的文件
- 当 hunk 无法安全分离时，不应强行提交；应把错误返回给 agent，再由 agent 征求用户意见
- 错误处理应包含：非零退出码、固定前缀错误码、以及正常英文的人类可读错误说明
- 为了提升成功率，临时 patch 文件应带唯一随机 ID
- helper 不采用 `npx` / CLI 子命令调用，而是作为已安装独立脚本随安装一起分发
- patch 文件名中加入 UTC 时间戳，便于 `ls` 排序与审计定位
- patch 正文保持标准 unified diff，不插入额外时间戳说明
- helper 输出中应包含 `createdAt` 等机器可读时间信息
- 已确认决策文档：`decisions/D01-v1-temp-and-error-protocol.md`
- 已确认决策文档：`decisions/D02-helper-as-installed-script.md`
- 已确认决策文档：`decisions/D03-patch-audit-timestamp.md`

## ❌ Rejected
- 仅按文件级归属：无法处理同一文件被两个并行会话分别修改的情况
- 直接以行号作为归属锚点：并发编辑下位置漂移太容易失效
- 发生 hunk 冲突时默认退化为全量提交：风险太高，必须显式征得用户同意
- helper 通过 `npx` 调用 CLI 子命令：会引入网络/确认成本与版本漂移风险
- 在 patch 正文中插入审计时间戳说明行：会增加 patch 应用风险
