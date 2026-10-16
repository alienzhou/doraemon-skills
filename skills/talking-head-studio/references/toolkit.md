# 本地工具与项目配置

工具只执行本机文件操作，不联网、不上传、不自动转写。检查/合成/验证只需要 Python 标准库和 PATH 中的 `ffmpeg`、`ffprobe`；背景模板另需 Pillow 和可用中文字体。

## 初始化工程

将技能中的 `scripts/video_tools.py` 和 `assets/render_background.py` 复制到工程根目录。这样交付的工程可以脱离技能目录运行。创建 `project.json` 和 `storyboard.json`，记录实际素材及其时间轴；给工程单独建立环境，或使用已验证的本机 Python/Pillow 环境。

以下是配置结构示例，路径、画幅、章节、裁切和时间必须按新视频填写：

```json
{
  "source": "../口播.mp4",
  "source_sha256": "从 inspect 报告填入实际 SHA-256",
  "background": "work/background.mp4",
  "output": "outputs/口播图解.mp4",
  "width": 1080,
  "height": 1920,
  "fps": 30,
  "window": {"start": 0, "duration": null},
  "portrait": {
    "crop": [0.2, 0.25, 0.6, 0.3375],
    "x": 676,
    "y": 1452,
    "size": 336,
    "border": 4
  },
  "topic": "本条视频的核心主题",
  "series": "系列名称",
  "chapters": [
    {"id": "a", "title": "第一部分"},
    {"id": "b", "title": "第二部分"}
  ],
  "storyboard": "storyboard.json",
  "transition": 0.35,
  "font": "/System/Library/Fonts/PingFang.ttc",
  "font_index": 2,
  "font_bold_index": 8
}
```

- 路径均相对 `project.json`，不是相对启动终端目录。
- `source_sha256` 建议填写；存在时工具会拒绝悄悄处理被替换的素材。重新确认新文件、转写及裁切后再更新。
- `window.duration: null` 表示从 start 到源文件结尾。样片填写实际 start/duration；背景从样片零时刻开始播放，storyboard 则始终使用**原视频绝对时间**。
- `portrait.crop` 使用自动旋转后的源画面归一化坐标。`x/y/size` 是输出像素中的圆窗左上角与直径，须为偶数；border 向外扩展，须留在画幅内。
- 未识别的 SDR 输入色彩矩阵默认按 BT.601 处理；查看素材后可用 `source_matrix: "bt709"` 明确指定。不要用该选项给 HDR 冒充 SDR。
- `width/height` 为偶数，保留原画幅。背景须与配置尺寸一致、使用 BT.709，并覆盖所有输出帧。
- `crf` 可选，合成默认 18。`palette` 可选，键名见背景模板顶部的 COLORS；当前颜色不是固定要求。
- 字体可换成本机字体。普通 TTF 通常将两个 font index 都设为 0；不要复制未知授权字体到技能包。

## 检查当前视频

```sh
python video_tools.py inspect ../口播.mp4 --output work/source.json --frames work/source-frames
```

随后实际查看抽帧、核对主题和裁切。报告里的原始流信息包含旋转、SAR、色彩和帧率信息。它不负责选择裁切，也不判断脸是否被挡住。

## 场景时间轴

```json
[
  {
    "start": 0,
    "end": 8.2,
    "chapter": "a",
    "kind": "overview",
    "headline": "围绕当前口播提炼的标题",
    "note": "可选的短说明",
    "items": ["一个要点", "另一个要点"]
  },
  {
    "start": 8.2,
    "end": 16.5,
    "chapter": "b",
    "kind": "flow",
    "headline": "一个有先后关系的过程",
    "items": ["准备", "实践", "复盘"]
  }
]
```

场景须连续、无重叠，并覆盖输出窗口。实际末尾时间来自本次视频，不能使用此例的 16.5 秒。模板类型：

- `overview`：并列总览，不画成依次完成的步骤。
- `cards`：简洁并排概念，适合比较或拆分。
- `flow`：有先后关系的过程。
- `focus`：单一关键词，items 只能有一项。

模板提供起点，不承担所有创作。故事需要分支、边界扩展、图形隐喻或别的解释形式时，直接扩展 `draw_scene`。出现文字挤压时改布局或缩短图解标签，不删除原声内容。

## 预览、渲染、合成

```sh
python render_background.py project.json --stills
python render_background.py project.json
python video_tools.py compose project.json
python video_tools.py verify project.json --face-check --report work/verification.json
```

预览在 `work/preview/`。原路径已有输出时，渲染/合成工具默认不覆盖；确认本轮应更新该文件后在命令中加 `--overwrite`，或使用新版本文件名。无需因此额外要求用户批准已授权的修改。

全片 AAC/ALAC 原音轨直接复制；样片或不兼容编码转为 AAC。没有添加字幕、音乐、音效或调速的代码。若用户明确改变这些要求，应另做相应功能，而不是声称此脚本已经支持。

## 检查范围与限制

`verify` 检查尺寸、时长、帧数、流数量；全片直接复制时比较原音轨哈希。`--face-check` 逐帧比较圆窗内部和同期源画面，可发现冻结、错位或时间偏移，不能判断被裁的区域是否真是脸。

转场、全部章节、首尾画面、人像边界、口播字幕是否被烧入仍需实际看导出成片。只有工具通过时不要宣布视觉审阅已通过。

工具针对单个 SDR 文件和一个固定圆窗。显著音画起始偏移、非方形像素、HDR、移动人像需要先规范化或扩展方案。它会对已检测到的这类条件报错；不能靠删掉校验假装解决。
