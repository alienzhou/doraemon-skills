#!/usr/bin/env python3
"""联系表（contact sheet）生成器：把抽帧拼成带时间戳的大图，实现「图文一起看」。

用法:
    python3 xhs_contact_sheet.py <out_dir> [--cols 4] [--cell-w 720] [--per-page 24]

产出 (写入 out_dir):
    sheet.jpg 或 sheet_p1.jpg / sheet_p2.jpg ...
    sheet.json  索引: 每格的 序号 / 秒数 / 原帧路径 / 所在页

设计取舍 (实测得出, 别乱调):
  * 单格宽度硬下限 700px。低于此值主标题仍可读, 但画面里最小号的注释会糊,
    而那些小注释往往正是画面独有的信息 (例如层级图里的 O(n)贵 / O(1)便宜)。
  * 每页最多 24 格。格子再多会迫使单格变小, 总览反而更不清楚, 不如分页。
  * 用 PIL 而非 ffmpeg tile: drawtext 里 mm:ss 的冒号会被当成 filter 分隔符,
    转义极脆; PIL 可控得多。
  * 角标写 "#序号 mm:ss": 序号用于回指 (「#09 那帧要细看」),
    秒数用于和带时间戳的 transcript 对齐。
"""
import argparse
import glob
import json
import os
import re
import sys

MIN_CELL_W = 700
MAX_PER_PAGE = 24
FONT_CANDIDATES = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def load_font(size):
    from PIL import ImageFont
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def frame_sec(path):
    m = re.search(r"_(\d+)s", os.path.basename(path))
    return int(m.group(1)) if m else -1


def build(files, cols, cell_w, out_path, start_idx, pad=6):
    from PIL import Image, ImageDraw
    ims = [Image.open(f).convert("RGB") for f in files]
    ratio = ims[0].height / ims[0].width
    cw, ch = cell_w, int(cell_w * ratio)
    rows = (len(ims) + cols - 1) // cols
    canvas = Image.new("RGB",
                       (cols * cw + pad * (cols + 1), rows * ch + pad * (rows + 1)),
                       (24, 24, 24))
    font = load_font(max(16, cw // 22))
    d = ImageDraw.Draw(canvas)
    index = []
    for i, (im, f) in enumerate(zip(ims, files)):
        gx, gy = i % cols, i // cols
        x, y = pad + gx * (cw + pad), pad + gy * (ch + pad)
        canvas.paste(im.resize((cw, ch), Image.LANCZOS), (x, y))
        n = start_idx + i
        sec = frame_sec(f)
        label = f"#{n:02d} {sec // 60:02d}:{sec % 60:02d}" if sec >= 0 else f"#{n:02d}"
        bb = d.textbbox((0, 0), label, font=font)
        d.rectangle([x + 4, y + 4, x + 12 + bb[2], y + 10 + bb[3]], fill=(0, 0, 0))
        d.text((x + 8, y + 6), label, fill=(255, 220, 0), font=font)
        index.append({"n": n, "sec": sec, "frame": os.path.basename(f),
                      "cell": [gx, gy]})
    canvas.save(out_path, quality=88, optimize=True)
    return canvas.size, index


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out_dir")
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--cell-w", type=int, default=720)
    ap.add_argument("--per-page", type=int, default=MAX_PER_PAGE)
    ap.add_argument("--src", default="frames", help="帧目录, 也可指向 keyframes")
    args = ap.parse_args()

    od = args.out_dir
    files = sorted(glob.glob(os.path.join(od, args.src, "*.jpg")))
    if not files:
        sys.exit(f"ERROR: {od}/{args.src} 下没有帧, 先跑 xhs_analyze_video.py")

    if args.cell_w < MIN_CELL_W:
        log(f"WARN: cell-w={args.cell_w} < {MIN_CELL_W}, 小号注释会糊。"
            f"总览只能用于定位结构, 细节务必回读单帧原图。")
    per_page = min(args.per_page, MAX_PER_PAGE)

    pages, index_all = [], []
    chunks = [files[i:i + per_page] for i in range(0, len(files), per_page)]
    for pi, chunk in enumerate(chunks):
        name = "sheet.jpg" if len(chunks) == 1 else f"sheet_p{pi + 1}.jpg"
        path = os.path.join(od, name)
        size, idx = build(chunk, args.cols, args.cell_w, path, pi * per_page)
        for it in idx:
            it["page"] = name
        index_all += idx
        pages.append({"file": name, "size": list(size),
                      "bytes": os.path.getsize(path), "cells": len(chunk)})
        log(f"  {name} {size[0]}x{size[1]} {os.path.getsize(path) / 1e3:.0f}KB")

    meta = {"pages": pages, "cols": args.cols, "cell_w": args.cell_w,
            "total_cells": len(files), "cells": index_all,
            "readable": args.cell_w >= MIN_CELL_W,
            "usage": "先读 sheet 定位结构; 某格有细节读不清时, 回读 frames/ 下对应单帧原图"}
    json.dump(meta, open(os.path.join(od, "sheet.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(json.dumps({"pages": pages, "total_cells": len(files),
                      "readable": meta["readable"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
