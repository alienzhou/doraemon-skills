# Error Handling

遇到任何脚本报错，**先在本文件查表**，不要自由发挥或反复重试同一命令。

---

## 通用排查顺序

1. 读脚本 stdout 最后一行的 JSON，取 `error` 字段
2. 在下表定位该错误码
3. 按"处理方式"操作，不要跳过

---

## 环境类

| 错误码 | 原因 | 处理方式 |
|---|---|---|
| `FFMPEG_NOT_FOUND` | 系统没装 ffmpeg | 告知用户执行 `brew install ffmpeg`（macOS）或 `apt install ffmpeg`（Linux）。**不要尝试用其他工具替代抽帧**。 |
| `DEPENDENCY_MISSING` | 用 `python3` 而非 `uv run` 执行 | 改用 `uv run <skill_directory>/scripts/xxx.py`。脚本头部的 PEP 723 声明只对 `uv run` 生效。 |
| `NO_CJK_FONT` | 系统缺中文字体 | macOS 一般自带 PingFang，报此错说明是精简系统。Linux 装 `fonts-noto-cjk`。或改用 AI 生图路线（路线 B）绕过本地字体。 |
| `UV_NOT_FOUND` | 没装 uv | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |

---

## 文件类

| 错误码 | 原因 | 处理方式 |
|---|---|---|
| `FILE_NOT_FOUND` | 路径不存在或文件被移动过 | **先用 `ls` 确认真实路径再重试**，不要凭记忆里的旧路径反复试——长会话里用户中途移动 / 重命名视频目录是常态。路径含中文或空格时务必加引号。 |
| `PERMISSION_DENIED` | 输出目录无写权限 | 换到 `/tmp` 或用户主目录下的路径 |

---

## 抽帧类

| 错误码 | 原因 | 处理方式 |
|---|---|---|
| `EXTRACT_TIMEOUT` | 视频过长或过大 | 增大 `--interval`，或直接用 `--timestamps` 只抽几个关键点 |
| `PROBE_TIMEOUT` | 文件损坏或非视频格式 | 让用户确认文件完整性 |
| 抽出的帧全是黑的 | 抽帧点正好落在转场 | 脚本已自动过滤纯黑帧。若过滤后候选太少，换 `--timestamps` 精确补抽，或把 `--interval` 调小 |

---

## IP 合成类

| 错误码 | 原因 | 处理方式 |
|---|---|---|
| `EMPTY_CUTOUT` | 立绘不是纯绿幕背景 | 重新生成立绘，prompt 里务必包含 `pure solid green screen chroma key background`。**白底或渐变底无法抠图**。 |
| 抠图后有绿边 | 绿幕不够纯或有反光 | 脚本已做去溢出。仍有残留说明源图绿幕质量差，重新生成 |
| IP 挡住了文字 | scale 太大或 position 选错 | 调小 `--scale`（0.4~0.5 较安全）或换 `--position`。**每次合成后必须用 Read 检查**——这是最容易翻车的环节 |
| IP 悬空显得突兀 | 没有出血 | 加 `--bleed 0.03` 让它轻微超出画面底边 |

---

## AI 生图类（路线 B）

| 现象 | 处理方式 |
|---|---|
| 生成的封面和视频内容割裂 | **必须把真实截图作为图生图输入**，prompt 加 `keep the genuine nodes recognizable, do not invent fake content` |
| 中文字渲染错乱 | AI 生图对中文支持不稳定。要么多跑几次挑好的，要么改用路线 A 本地合成文字 |
| 生成超时 | 高分辨率档位耗时显著增加，调高生图工具的超时参数（2K 约需 3 分钟，4K 约需 10 分钟），必要时降一档质量 |
| 图上出现了不该有的荣誉徽章 | 这是 AI 自己加的。用图生图明确要求 `completely REMOVE the badge that reads ...`，并在 prompt 里强调其余元素保持不变 |

---

## 参数类

| 错误码 | 处理方式 |
|---|---|
| `BAD_ARGS` | 读 `msg` 字段的具体说明。常见：`--title` 忘了用 `\|` 分隔两行；`--preset` 拼错（合法值：bilibili / douyin / xiaohongshu） |
