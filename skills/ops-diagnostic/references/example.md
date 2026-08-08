# 合成示例：取消后任务仍显示运行中

本例只展示诊断思路，不对应任何真实系统。

## 背景

系统链路：

```text
Client → API → Queue → Worker → Result Store → Notification Gateway → Client
```

用户取消任务后，Client 长时间仍显示 Running。已有日志证明 API 接收了取消请求，也证明最终状态稍后变为 Cancelled，但无法判断延迟发生在哪一段。

## 竞争假设账

| 假设 | 确诊条件 | 证伪条件 | 新事件与判别字段 | 预期序列 | 判定 |
| --- | --- | --- | --- | --- | --- |
| H1 取消信号在队列等待过久 | `queue_wait_ms` 接近用户观察到的延迟 | 信号很快出队 | `cancel_signal_dequeued`: queue_wait_ms | requested → dequeued → applied | pending |
| H2 Worker 收到信号但当前任务未检查取消状态 | 已出队，但 `cancel_observed=false` 持续到下一检查点 | Worker 很快观察到取消 | `worker_cancel_checkpoint`: observed, since_dequeue_ms | dequeued → checkpoint(false)… | pending |
| H3 Worker 已取消，但终态通知未发布 | Worker 已写 Cancelled，缺少 publish 或 publish 被跳过 | 通知紧随状态写入 | `terminal_publish_decision`: action, reason, since_state_write_ms | state_changed → publish_decision | pending |
| H4 通知已到 Client，但本地状态未应用 | 服务端已发送且 Client 已接收，缺少 applied | Client 正常应用 | `terminal_event_applied`: previous, next, ignored_reason | sent → received → applied | pending |

## 为什么这些字段有判别力

- `queue_wait_ms` 将队列延迟和 Worker 内部延迟分开。
- `observed` 与 `since_dequeue_ms` 能证明信号是否被执行循环看到。
- `action` 和 `reason` 将“没有通知”拆为未调用、主动跳过或调用失败。
- `previous`、`next` 和 `ignored_reason` 将传输问题与客户端状态归并问题分开。

## 不合格的替代方案

以下日志不能有效区分假设：

```text
cancel processing
worker running
notification handled
```

它们没有状态、相对时间、结果来源或跳过原因。

## 收尾示例

若复现证明 H3 成立：

- `terminal_publish_decision` 若能长期解释终态缺失，改为正式事件并保留。
- 高频 `worker_cancel_checkpoint` 只为排除 H2，复现后回滚或降为受控 debug 日志。
- 把确诊证据交回排障报告，不在诊断 Skill 中直接修改通知逻辑。
