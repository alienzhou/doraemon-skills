# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10.0"]
# ///

"""用真实视频帧 + 文字排版合成封面（路线 A：真实截图版）。

按平台预设自动套用尺寸、安全区和排版结构。
"""

import sys
import json
from pathlib import Path

PRESETS = {
    "bilibili": {"size": (1920, 1080), "layout": "left-text"},
    "douyin": {"size": (1080, 1920), "layout": "top-text"},
    "xiaohongshu": {"size": (1080, 1440), "layout": "top-text"},
}

FONT_CANDIDATES = [
    # macOS
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    # Linux
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    # Windows
    "C:/Windows/Fonts/msyhbd.ttc",
    "C:/Windows/Fonts/msyh.ttc",
]


def pick_font():
    for f in FONT_CANDIDATES:
        if Path(f).exists():
            return f
    raise EnvironmentError("NO_CJK_FONT")


def load_font(size, index=8):
    from PIL import ImageFont

    path = pick_font()
    try:
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        return ImageFont.truetype(path, size)


def build(frame, out, preset, title, subtitle, badge, accent):
    from PIL import Image, ImageDraw, ImageEnhance

    if not Path(frame).exists():
        raise FileNotFoundError(frame)
    if preset not in PRESETS:
        raise ValueError(f"--preset must be one of {tuple(PRESETS)}")

    W, H = PRESETS[preset]["size"]
    layout = PRESETS[preset]["layout"]
    accent_rgb = tuple(int(accent.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))

    src = Image.open(frame).convert("RGB")
    src = ImageEnhance.Brightness(src).enhance(1.45)
    src = ImageEnhance.Color(src).enhance(1.3)

    canvas = Image.new("RGB", (W, H), (4, 7, 13))

    if layout == "left-text":
        # 横版：左字右图
        bw = int(W * 0.58)
        bh = int(src.height * bw / src.width)
        canvas.paste(src.resize((bw, bh), Image.LANCZOS), (W - bw, (H - bh) // 2))
        mask = Image.new("L", (W, H), 0)
        md = ImageDraw.Draw(mask)
        fade_end, fade_start = int(W * 0.38), int(W * 0.55)
        for x in range(W):
            if x < fade_end:
                v = 255
            elif x < fade_start:
                v = int(255 - (x - fade_end) / (fade_start - fade_end) * 255)
            else:
                v = 0
            md.line([(x, 0), (x, H)], fill=v)
        text_x, title_y = int(W * 0.045), int(H * 0.13)
    else:
        # 竖版/方版：上字下图，底部留安全区
        safe_bottom = 0.25 if preset == "douyin" else 0.15
        img_top = int(H * 0.42)
        bw = W
        bh = int(src.height * bw / src.width)
        max_h = int(H * (1 - safe_bottom)) - img_top
        if bh > max_h:
            bw = int(src.width * max_h / src.height)
            bh = max_h
        canvas.paste(src.resize((bw, bh), Image.LANCZOS), ((W - bw) // 2, img_top))
        mask = Image.new("L", (W, H), 0)
        md = ImageDraw.Draw(mask)
        for y in range(H):
            if y < img_top - int(H * 0.03):
                v = 255
            elif y < img_top + int(H * 0.04):
                v = int(255 - (y - (img_top - int(H * 0.03))) / (H * 0.07) * 255)
            elif y > img_top + bh - int(H * 0.05):
                v = min(255, int((y - (img_top + bh - int(H * 0.05))) / (H * 0.05) * 255))
            else:
                v = 0
            md.line([(0, y), (W, y)], fill=max(0, min(255, v)))
        text_x, title_y = int(W * 0.06), int(H * 0.08)

    canvas = Image.composite(Image.new("RGB", (W, H), (4, 7, 13)), canvas, mask)
    d = ImageDraw.Draw(canvas)

    lines = [ln for ln in title.split("|") if ln.strip()][:2]
    base = int(H * (0.115 if layout == "left-text" else 0.10))
    y = title_y
    for i, line in enumerate(lines):
        fs = base if i == 0 else int(base * 1.22)
        color = (255, 255, 255) if i == 0 else (255, 214, 10)
        fo = load_font(fs)
        d.text((text_x, y), line.strip(), font=fo, fill=color,
               stroke_width=max(4, fs // 22), stroke_fill=(0, 0, 0))
        y += int(fs * 1.18)

    y += int(H * 0.015)
    d.rectangle([text_x + 4, y, text_x + int(W * 0.18), y + max(5, H // 180)],
                fill=accent_rgb)
    y += int(H * 0.045)

    if subtitle:
        fs = int(base * 0.42)
        fo = load_font(fs, index=5)
        for line in subtitle.split("|")[:2]:
            d.text((text_x, y), line.strip(), font=fo, fill=(238, 243, 252),
                   stroke_width=max(3, fs // 16), stroke_fill=(0, 0, 0))
            y += int(fs * 1.35)
        y += int(H * 0.02)

    if badge:
        fs = int(base * 0.3)
        fo = load_font(fs)
        tw = int(d.textlength(badge, font=fo))
        pad = int(fs * 0.7)
        d.rounded_rectangle([text_x, y, text_x + tw + pad * 2, y + fs + pad],
                            (fs + pad) // 2, fill=accent_rgb)
        d.text((text_x + pad, y + pad // 2), badge, font=fo, fill=(3, 18, 14))

    op = Path(out)
    op.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(op, quality=95)
    return {"output": str(op), "size": [W, H], "preset": preset,
            "reminder": "用 Read 工具检查成品，确认手机尺寸下文字清晰、主体元素不超过 6 个"}


def main():
    args = sys.argv[1:]
    frame = out = None
    preset, title, subtitle, badge = "bilibili", "", "", ""
    accent = "#00EBA5"

    for i, a in enumerate(args):
        if a == "--frame" and i + 1 < len(args):
            frame = args[i + 1]
        elif a == "--out" and i + 1 < len(args):
            out = args[i + 1]
        elif a == "--preset" and i + 1 < len(args):
            preset = args[i + 1]
        elif a == "--title" and i + 1 < len(args):
            title = args[i + 1]
        elif a == "--subtitle" and i + 1 < len(args):
            subtitle = args[i + 1]
        elif a == "--badge" and i + 1 < len(args):
            badge = args[i + 1]
        elif a == "--accent" and i + 1 < len(args):
            accent = args[i + 1]

    if not frame or not title:
        raise ValueError("--frame and --title are required（标题用 | 分隔两行）")
    if not out:
        out = f"/tmp/cover_{preset}.png"
    return {"data": build(frame, out, preset, title, subtitle, badge, accent)}


def classify_error(e: Exception) -> dict:
    msg = str(e)
    if isinstance(e, FileNotFoundError):
        return {"error": "FILE_NOT_FOUND", "msg": f"帧文件不存在：{msg}"}
    if isinstance(e, EnvironmentError):
        return {"error": "NO_CJK_FONT", "msg": "系统缺少中文字体，请安装 Noto Sans CJK 或 PingFang"}
    if isinstance(e, ImportError):
        return {"error": "DEPENDENCY_MISSING", "msg": "缺少 Pillow，请用 uv run 执行本脚本"}
    if isinstance(e, ValueError):
        return {"error": "BAD_ARGS", "msg": msg}
    if isinstance(e, PermissionError):
        return {"error": "PERMISSION_DENIED", "msg": f"无权限写入输出路径：{msg}"}
    return {"error": "UNKNOWN", "msg": f"脚本执行异常: {msg}"}


if __name__ == "__main__":
    try:
        result = main()
        response = {"ok": True}
        response.update(result)
        print(json.dumps(response, ensure_ascii=False))
    except Exception as e:
        err = classify_error(e)
        print(json.dumps({"ok": False, **err}, ensure_ascii=False))
        sys.exit(1)
