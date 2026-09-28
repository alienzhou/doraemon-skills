# 实例数据契约

实例完全独立，包含 `index.html`、`styles.css`、`app.js`、`server.mjs`、`data-utils.mjs`、`README.md`、`instance.json`、`data.json`。不包含旧主题、录音、图片、缓存或依赖安装目录。服务不暴露文件列表、配置、任意路径或写接口。

`data.json` 是唯一内容源；服务将已验证快照转换为 `/data.js` 供初次加载，通过 `/events` 发布完整 JSON 快照。输入不执行 JavaScript，页面使用 textContent 渲染文本。固定 HTTP 资源只有 `/`、`/index.html`、`/app.js`、`/styles.css`、`/data.js`、`/events`、`/health`；`/health` 仅含 instanceId、port、revision。原始遍历路径和其他资源返回 404；非 GET/HEAD 返回 405；外国 Host、非同源 Origin 与跨站浏览器请求返回 403。无目录、PID、配置或堆栈接口，无 CORS 授权。用户自己写在节点里的路径是用户内容，不自动删除。

```json
{
  "title": "讨论脑图",
  "generation": "由脚本管理",
  "root": { "id": "稳定唯一标识", "t": "讨论脑图", "children": [] }
}
```

- `title`：1–300 字符，不含控制字符；标题仅命名，不意味着节点已产生观点。
- `root`：始终存在，可以只含标题且 children 为空。每个节点有字符串 `t`（最多 2000 字符）、可选字符串 `note`（最多 10000 字符）、可选数组 `children`。
- 只保存以上字段与 `id`；未知字段不会进入产物。最多 3000 节点、40 层。
- 创建/更新时缺少 `id` 的节点自动分配 UUID；已有 ID 在改名、移动、排序时保留，删除后不要给无关新节点复用。不要每轮重建所有 ID，也不要用标题或下标作 ID。
- `generation` 由创建/重置脚本生成；普通更新即使输入携带 generation 也保留旧值。重置生成新根 ID 和 generation，客户端退出演示、清折叠/选择/搜索并适配新空图。
- `instance.json` 记录实例身份和默认端口，不由讨论更新覆盖。端口只影响该服务；浏览器输入设备偏好按来源 localStorage 保存。
- `inspect-instance.mjs` 返回原始数据 SHA-256；更新要求相同哈希。若冲突，重新读取并合并，不能强制覆盖。候选 JSON 可放平台临时目录，完成后只清理自己创建的临时输入。
- `.update.lock` 仅防并发写入；异常中断可能遗留锁。先确认锁中 PID 属于本次实例且已退出，才可以清理明确归属的锁，不动未知进程。

## 内容审查例

用户说「先聊甲，我觉得它可能只适合小团队；再聊乙，暂时没结论」。可按原顺序保留「甲 → 我觉得可能只适合小团队」「乙 → 暂时没结论」。不可写成「甲适用于所有团队」「乙的三步落地方案」。这些仅为规则示例，**不写进新实例**。

## 生命周期

有限脚本（创建、检查、更新、测试）最后一行输出 `{"ok":true,"data":{...}}`，退出 0；失败 `{"ok":false,"error":"CODE","msg":"说明"}`，退出 1。公共模块不独立运行，不产生 stdout。

服务器是长运行程序：就绪 JSON 不是退出结果；日志写 stderr，正常停止后给最终 JSON。SSE 本身是 HTTP 流，不是脚本 stdout，含 `revision` 与完整 `data`；重启 revision 可从 1 开始，客户端同时对比快照而非仅比较序号。无效磁盘快照只记 stderr 错误并保留最后有效版本，修复后自动恢复。
