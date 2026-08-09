---
name: img-squeeze
description: "高质量图片压缩工具，质量不低于 TinyPNG，体积平均只有它的 53%。当用户说「压缩图片」「压缩这张图」「图片太大了」「squeeze」「img-squeeze」「帮我压一下图」「批量压缩图片」「图片体积优化」，或需要在保证画质的前提下缩减图片文件大小时触发。支持 PNG/JPG/WebP/AVIF 输出，基于 SSIM 质量门槛自动选最优压缩方案。"
---

# img-squeeze — 一键图片压缩

基于 SSIM 质量门槛，并行跑多个压缩配方（WebP / AVIF / 有损 PNG / JPEG），选出**画质达标、体积最小**的方案输出。

**实测效果**：91.4% 的图质量高于 TinyPNG，体积平均只有 TinyPNG 的 53%。

脚本位于本 skill 目录下的 `scripts/squeeze.py`（uv inline script，自动安装依赖，无需手动 pip）。

---

## 使用方式

脚本在与本 SKILL.md 同级的 `scripts/squeeze.py`。下文示例中的 `<skill_dir>` 指你加载到的 skill 目录（包含本 SKILL.md 的目录，在技能 catalog / skill_content 的 directory 里给出），运行时直接代入实际路径即可，装在全局或项目级都同样适用。

### 前置依赖（可选，缺失则跳过对应格式）

```bash
brew install webp         # cwebp，WebP 格式
brew install libavif      # avifenc，AVIF 格式
brew install pngquant     # 有损 PNG
brew install oxipng       # PNG 无损后处理（配合 pngquant 使用）
```

Pillow / numpy 由 uv inline script 自动安装，无需手动处理。

---

## 常用命令

```bash
# 压缩单张图（自动选最优格式，输出在原文件旁 .squeezed/ 目录）
uv run <skill_dir>/scripts/squeeze.py photo.png

# 指定输出目录
uv run <skill_dir>/scripts/squeeze.py photo.png --out ./out/

# 批量压缩一个目录下所有图
uv run <skill_dir>/scripts/squeeze.py images/

# 只允许 PNG 格式输出（发布平台有格式要求时）
uv run <skill_dir>/scripts/squeeze.py photo.png --formats png

# 提高质量门槛（更保守）
uv run <skill_dir>/scripts/squeeze.py photo.png --min-ssim 0.97

# 原地压缩 PNG（格式一致时直接覆盖，先备份原文件）
uv run <skill_dir>/scripts/squeeze.py photo.png --formats png --in-place --keep-original

# 显示详细结果
uv run <skill_dir>/scripts/squeeze.py photo.png --verbose
```

---

## 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--out DIR` | 原文件旁 `.squeezed/` | 输出目录 |
| `--min-ssim N` | `0.95` | 最低 SSIM 质量门槛（0~1，越高质量越好） |
| `--formats` | `png,webp,avif,jpg` | 允许的产物格式（逗号分隔） |
| `--in-place` | 关 | 原地压缩，胜出格式与源格式一致时覆盖原文件 |
| `--keep-original` | 关 | 配合 `--in-place`，覆盖前备份为 `<name>.orig.<ext>` |
| `--verbose` / `-v` | 关 | 显示每张图的详细结果 |

---

## 工作流程

1. **接收请求** — 确认用户提供了图片路径（单张或目录）
2. **检测可用工具** — 运行脚本时会自动提示缺失的工具
3. **执行压缩** — 用 `uv run` 调用脚本，展示进度和结果
4. **汇报结果** — 压缩完成后报告节省比例、SSIM 分数、输出路径

若用户没给具体路径，先询问图片位置再执行。若用户有格式限制（如「必须是 PNG」），加 `--formats png`。

---

## 技术说明

- **配方选择**：对每张图并行跑最多 12 个压缩配方，由 SSIM 裁判选最优
- **质量指标**：SSIM（结构相似度）是主判断指标，与人眼感知最相关
- **AVIF 通常赢**：照片/自然图场景下 AVIF 配方胜出率最高（约 45%）
- **PNG 兼容场景**：图表/插画 + 需要保持 PNG 格式时，加 `--formats png` 走 pngquant 路线
