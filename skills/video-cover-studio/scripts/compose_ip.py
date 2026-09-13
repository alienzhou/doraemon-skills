# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10.0", "numpy>=1.24"]
# ///

"""把绿幕 IP 立绘抠图后合成到封面指定角落。

处理链：绿幕抠图 → 去绿溢出 → 边缘羽化 → 柔光底衬 → 合成
"""

import sys
import json
from pathlib import Path

POSITIONS = ("bottom-left", "bottom-right", "top-left", "top-right")


def cutout(ip_path: str):
    """绿幕抠图，返回带 alpha 的 RGBA 图像（已裁到内容包围盒）。"""
    import numpy as np
    from PIL import Image, ImageFilter

    im = Image.open(ip_path).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]

    # 绿幕判定：绿通道明显高于红蓝两者
    green = (G > 90) & (G - R > 45) & (G - B > 45)
    alpha = np.where(green, 0, 255).astype(np.uint8)
    am = Image.fromarray(alpha)
    # 收缩 1px 去掉绿边，再羽化避免锯齿
    am = am.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))

    # 去绿溢出：边缘反光的绿色在深色背景上很显眼
    arr = np.asarray(im).astype(np.float32)
    spill = arr[:, :, 1] > (arr[:, :, 0] + arr[:, :, 2]) / 2 + 12
    arr[:, :, 1] = np.where(
        spill, (arr[:, :, 0] + arr[:, :, 2]) / 2 + 12, arr[:, :, 1]
    )
    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    out.putalpha(am)

    bbox = am.point(lambda p: 255 if p > 20 else 0).getbbox()
    if bbox is None:
        raise ValueError("EMPTY_CUTOUT")
    return out.crop(bbox)


def compose(cover, ip, outpath, position, scale, glow, bleed):
    from PIL import Image, ImageDraw, ImageFilter

    if not Path(cover).exists():
        raise FileNotFoundError(cover)
    if not Path(ip).exists():
        raise FileNotFoundError(ip)
    if position not in POSITIONS:
        raise ValueError(f"--position must be one of {POSITIONS}")
    if not 0.1 <= scale <= 0.95:
        raise ValueError("--scale should be between 0.1 and 0.95")

    fig = cutout(ip)
    bg = Image.open(cover).convert("RGBA")
    W, H = bg.size

    th = int(H * scale)
    tw = max(1, int(fig.width * th / fig.height))
    fig = fig.resize((tw, th), Image.LANCZOS)

    margin = int(W * 0.02)
    bleed_px = int(H * bleed)
    if position.endswith("left"):
        x = margin
    else:
        x = W - tw - margin
    if position.startswith("bottom"):
        y = H - th + bleed_px
    else:
        y = margin

    if glow:
        # 柔光底衬让人物从深色背景里浮出来
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        pad = 140
        blob = Image.new("RGBA", (tw + pad, th + pad), (0, 0, 0, 0))
        ImageDraw.Draw(blob).ellipse([0, 0, tw + pad, th + pad], fill=(30, 220, 170, 50))
        blob = blob.filter(ImageFilter.GaussianBlur(55))
        layer.alpha_composite(blob, (x - pad // 2, y - pad // 2))
        bg = Image.alpha_composite(bg, layer)

    bg.alpha_composite(fig, (x, y))

    out = Path(outpath)
    out.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(out)

    return {
        "output": str(out),
        "cover_size": [W, H],
        "ip_size": [tw, th],
        "position": position,
        "placed_at": [x, y],
        "reminder": "用 Read 工具检查合成结果，确认 IP 形象没有遮挡标题文字或徽章",
    }


def main():
    args = sys.argv[1:]
    cover = ip = outpath = None
    position, scale, bleed = "bottom-left", 0.47, 0.03
    glow = "--no-glow" not in args

    for i, a in enumerate(args):
        if a == "--cover" and i + 1 < len(args):
            cover = args[i + 1]
        elif a == "--ip" and i + 1 < len(args):
            ip = args[i + 1]
        elif a == "--out" and i + 1 < len(args):
            outpath = args[i + 1]
        elif a == "--position" and i + 1 < len(args):
            position = args[i + 1]
        elif a == "--scale" and i + 1 < len(args):
            scale = float(args[i + 1])
        elif a == "--bleed" and i + 1 < len(args):
            bleed = float(args[i + 1])

    if not cover or not ip:
        raise ValueError("--cover and --ip are required")
    if not outpath:
        p = Path(cover)
        outpath = str(p.with_name(p.stem + "_带IP" + p.suffix))

    return {"data": compose(cover, ip, outpath, position, scale, glow, bleed)}


def classify_error(e: Exception) -> dict:
    msg = str(e)
    if isinstance(e, FileNotFoundError):
        return {"error": "FILE_NOT_FOUND", "msg": f"文件不存在：{msg}"}
    if isinstance(e, ImportError):
        return {"error": "DEPENDENCY_MISSING", "msg": "缺少 Pillow/numpy，请用 uv run 执行本脚本"}
    if isinstance(e, ValueError):
        if msg == "EMPTY_CUTOUT":
            return {
                "error": "EMPTY_CUTOUT",
                "msg": "抠图结果为空，IP 立绘可能不是纯绿幕背景，请重新生成绿幕版立绘",
            }
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
