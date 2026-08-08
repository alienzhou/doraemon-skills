# 例子：异步任务状态更新

以下是合成场景，用来说明如何从数据流选择日志，不对应任何真实系统。

## 数据流

```text
HTTP API → Queue → Worker → Result Store → Notification Gateway → Client
```

新增功能允许用户取消正在执行的任务。

## 不足的日志

```text
cancel called
task updated
notification sent
```

问题：看不出取消针对哪个执行阶段、更新前后状态、由谁产生终态，也无法区分“未找到”“已结束”“取消成功但通知失败”。

## 面向排障的事件

| 事件 | 关键字段 | 能回答的问题 |
| --- | --- | --- |
| `task_cancel_requested` | current_state, source | 请求到达时任务处于什么状态？ |
| `task_cancel_rejected` | current_state, reason | 为什么没有进入取消流程？ |
| `task_cancel_signal_sent` | worker_present, queue_delay_ms | 信号是否发给了实际执行者？ |
| `task_state_changed` | previous, next, trigger | 状态由谁、因为什么变化？ |
| `task_terminal_event_published` | terminal_state, subscriber_count | 终态是否进入通知链路？ |
| `task_terminal_event_skipped` | reason | 为什么没有发布终态？ |

## 取舍

- 不记录完整任务参数和用户输入。
- 不记录每次轮询；只记录状态变化和异常阶段耗时。
- correlation ID 由项目现有 logger context 注入，不在每次调用手工传递。
- 如果通知网关已有等价事件，不重复打点，只保证关联 ID 能串联。
