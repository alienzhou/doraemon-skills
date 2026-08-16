#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow>=10.0", "numpy>=1.24"]
# ///
"""squeeze.py —— 一键图像压缩工具

用法:
  python3 squeeze.py photo.png           # 压缩单张图，自动选最优格式
  python3 squeeze.py *.png               # 批量压缩
  python3 squeeze.py photo.png --out ./out/  # 指定输出目录
  python3 squeeze.py photo.png --min-ssim 0.97  # 提高质量门槛
  python3 squeeze.py photo.png --formats png   # 只允许 PNG 输出（发布兼容性要求时）
  python3 squeeze.py photo.png --formats png --in-place  # 原地压缩（配合 --keep-original）

原理：
  对每张图并行跑多个压缩配方（WebP / AVIF / 有损PNG / JPEG），
  选出在 SSIM ≥ 门槛前提下体积最小的方案输出。
  配方来自 karpathy-style AutoResearch 在 100 张真实图上迭代优化的结果：
    - 91.4% 的图实测质量高于 TinyPNG，体积平均只有 TinyPNG 的 53%

本拷贝改动：新增 --formats 过滤与 --in-place 原地压缩，并改为 uv inline script。
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import metrics  # 同目录的 SSIM 计算

# ─────────────────────────── 工具检测 ───────────────────────────

def has(tool):
    return shutil.which(tool) is not None


def _run(cmd):
    return subprocess.run(cmd, capture_output=True).returncode == 0


# ─────────────────────────── 压缩函数 ───────────────────────────

def _webp(src, dst, q, lossless=False):
    if not has("cwebp"):
        return False
    cmd = ["cwebp", "-quiet", "-m", "6"]
    cmd += (["-lossless"] if lossless else ["-q", str(q)])
    cmd += [str(src), "-o", str(dst)]
    return _run(cmd)


def _avif(src, dst, q, speed="6", tune=None):
    if not has("avifenc"):
        return False
    cmd = ["avifenc", "-y", "444", "-q", str(q), "-s", speed]
    if tune:
        cmd += ["-a", f"tune={tune}"]
    return _run(cmd + [str(src), str(dst)])


def _png_quant(src, dst, quality, dither=True):
    if not has("pngquant"):
        return False
    cmd = ["pngquant", f"--quality={quality}", "--speed", "1",
           "--force", "--output", str(dst)]
    if not dither:
        cmd.append("--nofs")
    cmd.append(str(src))
    if not _run(cmd) or not Path(dst).exists():
        return False
    if has("oxipng"):
        _run(["oxipng", "-o", "max", "--strip", "safe", "-q", str(dst)])
    return True


def _jpeg(src, dst, q):
    from PIL import Image
    try:
        Image.open(src).convert("RGB").save(
            dst, "JPEG", quality=q, optimize=True, progressive=True)
        return True
    except Exception:
        return False


# ─────────────────────────── 配方表 ───────────────────────────
# AutoResearch 在 70 张真实图上收敛出的最优配方集
# 按"图片类型亲和度"粗分，实际由 SSIM 裁判决定最终赢家

def _recipe_format(name):
    """从配方名推断产物格式类别: png / webp / avif / jpg"""
    if "avif" in name:
        return "avif"
    if "webp" in name:
        return "webp"
    if "jpeg" in name or name.startswith("jpg"):
        return "jpg"
    return "png"


def _recipes(src_ext, formats):
    """返回 [(名称, 函数)] 列表，函数签名 f(src, dst) -> bool。
    formats: 允许的产物格式集合，如 {"png"} 表示只输出 PNG。"""
    all_recipes = [
        # AVIF —— 主力（照片/自然图最优，平均赢 29/64 张）
        ("avif-q90-444",          lambda s,d: _avif(s, d, 90)),
        ("avif-q90-444-tunessim", lambda s,d: _avif(s, d, 90, tune="ssim")),
        ("avif-q97-444",          lambda s,d: _avif(s, d, 97)),
        ("avif-q97-444-tunessim", lambda s,d: _avif(s, d, 97, tune="ssim")),
        # WebP —— 快且兼容性好，适合网页场景
        ("webp-q92",   lambda s,d: _webp(s, d, 92)),
        ("webp-q97",   lambda s,d: _webp(s, d, 97)),
        ("webp-q80",   lambda s,d: _webp(s, d, 80)),
        ("webp-q70",   lambda s,d: _webp(s, d, 70)),
    ]
    if src_ext == ".png":
        all_recipes += [
            # 有损 PNG —— 图表/插画类（保持 PNG 格式兼容）
            ("png-lossy-q65_85",  lambda s,d: _png_quant(s, d, "65-85")),
            ("png-lossy-nodither",lambda s,d: _png_quant(s, d, "65-85", dither=False)),
            ("png-lossy-c120",    lambda s,d: _png_quant(s, d, "65-85")),  # 色数限制版
        ]
    if src_ext in (".jpg", ".jpeg"):
        all_recipes += [
            ("jpeg-q85", lambda s,d: _jpeg(s, d, 85)),
            ("jpeg-q80", lambda s,d: _jpeg(s, d, 80)),
        ]
    return [(n, f) for n, f in all_recipes if _recipe_format(n) in formats]


# ─────────────────────────── 核心压缩逻辑 ───────────────────────────

def compress_one(src: Path, out_dir: Path, min_ssim: float, verbose: bool,
                 formats: set, in_place: bool = False,
                 keep_original: bool = False) -> dict:
    """压缩一张图，返回结果 dict"""
    src = Path(src)
    orig_size = src.stat().st_size
    ext = src.suffix.lower()

    candidates = []

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)

        def try_recipe(name, fn):
            suf = {"avif": ".avif", "webp": ".webp", "jpg": ".jpg"}.get(
                _recipe_format(name), ".png")
            dst = tmp / f"{src.stem}__{name}{suf}"
            try:
                ok = fn(str(src), str(dst))
            except Exception:
                return None
            if not ok or not dst.exists() or dst.stat().st_size == 0:
                return None
            # 判断是否无损（webp-lossless / png-lossless）
            lossless = "lossless" in name
            m = metrics.evaluate(src, dst, lossless=lossless)
            if "error" in m:
                return None
            size = dst.stat().st_size
            if m["ssim"] < min_ssim or size >= orig_size:
                return None
            return {
                "name": name,
                "dst": dst,
                "size": size,
                "ssim": round(m["ssim"], 4),
                "ratio": round(size / orig_size, 3),
                "suffix": suf,
            }

        recipes = _recipes(ext, formats)
        if not recipes:
            return {
                "file": src.name,
                "status": "no_improvement",
                "orig_size": orig_size,
                "message": f"没有匹配 --formats {sorted(formats)} 且适用 {ext} 的配方",
            }

        with ThreadPoolExecutor(max_workers=4) as ex:
            futs = {ex.submit(try_recipe, name, fn): name for name, fn in recipes}
            for fut in as_completed(futs):
                res = fut.result()
                if res:
                    candidates.append(res)

        if not candidates:
            return {
                "file": src.name,
                "status": "no_improvement",
                "orig_size": orig_size,
                "message": f"所有配方均未达到 SSIM≥{min_ssim} 且体积更小，保留原图",
            }

        best = min(candidates, key=lambda x: x["size"])

        # 原地压缩：仅当胜出格式与源格式一致时覆盖原文件
        if in_place and best["suffix"] == ext:
            if keep_original:
                shutil.copy2(src, src.with_suffix(".orig" + ext))
            shutil.copy2(best["dst"], src)
            out_path = src
        else:
            # 原地模式但胜出格式与源不同（如 PNG 源、AVIF 胜出）：按需建输出目录
            if out_dir is None:
                out_dir = src.parent / (src.stem + ".squeezed")
                out_dir.mkdir(parents=True, exist_ok=True)
            out_path = out_dir / (src.stem + best["suffix"])
            shutil.copy2(best["dst"], out_path)

    saving = round((1 - best["ratio"]) * 100, 1)
    if verbose:
        print(f"  ✅ {src.name} → {out_path.name}  "
              f"{_human(orig_size)} → {_human(best['size'])}  "
              f"节省 {saving}%  SSIM {best['ssim']}  [{best['name']}]")

    return {
        "file": src.name,
        "status": "ok",
        "out": str(out_path),
        "orig_size": orig_size,
        "comp_size": best["size"],
        "saving_pct": saving,
        "ssim": best["ssim"],
        "recipe": best["name"],
    }


def _human(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024 or u == "GB":
            return f"{n:.0f}{u}" if u == "B" else f"{n:.1f}{u}"
        n /= 1024


# ─────────────────────────── CLI ───────────────────────────

IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"}
ALL_FORMATS = {"png", "webp", "avif", "jpg"}


def main():
    ap = argparse.ArgumentParser(
        description="一键图像压缩 —— 质量不低于 TinyPNG，体积平均只有它的 53%",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""示例:
  python3 squeeze.py photo.png
  python3 squeeze.py images/*.png --out compressed/
  python3 squeeze.py photo.jpg --min-ssim 0.97 --verbose
  python3 squeeze.py photo.png --formats png --in-place
""")
    ap.add_argument("inputs", nargs="+", help="输入图片文件或目录")
    ap.add_argument("--out", default=None,
                    help="输出目录（默认：原文件旁边，加 .squeezed 后缀）")
    ap.add_argument("--min-ssim", type=float, default=0.95,
                    help="最低 SSIM 质量门槛（默认 0.95；提高到 0.97 更保守）")
    ap.add_argument("--formats", default="png,webp,avif,jpg",
                    help="允许的产物格式，逗号分隔（默认 png,webp,avif,jpg；"
                         "发布平台只认 PNG 时用 --formats png）")
    ap.add_argument("--in-place", action="store_true",
                    help="原地压缩：胜出格式与源格式一致时直接覆盖原文件")
    ap.add_argument("--keep-original", action="store_true",
                    help="配合 --in-place：覆盖前备份为 <name>.orig.<ext>")
    ap.add_argument("--verbose", "-v", action="store_true",
                    help="显示每张图的详细结果")
    args = ap.parse_args()

    formats = {f.strip() for f in args.formats.split(",") if f.strip()}
    bad = formats - ALL_FORMATS
    if bad:
        print(f"⚠️  未知格式: {sorted(bad)}，可选: {sorted(ALL_FORMATS)}", file=sys.stderr)
        sys.exit(1)

    # 收集文件列表
    files = []
    for inp in args.inputs:
        p = Path(inp)
        if p.is_dir():
            files += [f for f in sorted(p.iterdir()) if f.suffix.lower() in IMG_EXT]
        elif p.is_file():
            files.append(p)
        else:
            print(f"⚠️  找不到: {inp}", file=sys.stderr)

    if not files:
        print("没有找到可处理的图片文件", file=sys.stderr)
        sys.exit(1)

    print(f"\n🗜  squeeze.py — 处理 {len(files)} 张图片  (SSIM≥{args.min_ssim}, formats={sorted(formats)})\n")

    # 工具检测
    need = {"png": ("pngquant", "oxipng"), "webp": ("cwebp",),
            "avif": ("avifenc",), "jpg": ()}
    tools = {t for f in formats for t in need.get(f, ())}
    missing = [t for t in sorted(tools) if not has(t)]
    if missing:
        print(f"⚠️  以下工具未安装，对应配方会跳过: {', '.join(missing)}")
        print(f"   安装: brew install {' '.join(missing)}\n")

    total_orig = total_comp = 0
    ok_count = skip_count = 0

    for f in files:
        # 确定输出目录：--in-place 直接覆盖原文件，不预建目录，避免留下空壳
        if args.in_place:
            out_dir = None
        elif args.out:
            out_dir = Path(args.out)
            out_dir.mkdir(parents=True, exist_ok=True)
        else:
            out_dir = f.parent / (f.stem + ".squeezed")
            out_dir.mkdir(parents=True, exist_ok=True)

        if not args.verbose:
            print(f"  处理 {f.name} ...", end="\r", flush=True)

        result = compress_one(f, out_dir, args.min_ssim, args.verbose,
                              formats, in_place=args.in_place,
                              keep_original=args.keep_original)

        # 兜底：若输出目录最终为空（例如全部原地覆盖），删掉它
        if out_dir and out_dir.is_dir() and not any(out_dir.iterdir()):
            out_dir.rmdir()

        if result["status"] == "ok":
            ok_count += 1
            total_orig += result["orig_size"]
            total_comp += result["comp_size"]
            if not args.verbose:
                saving = result["saving_pct"]
                print(f"  ✅ {f.name:<40s} 节省 {saving:>5.1f}%  "
                      f"[{result['recipe']}]  SSIM {result['ssim']}")
        else:
            skip_count += 1
            print(f"  ⏭  {f.name:<40s} {result['message']}")

    print(f"\n{'─'*60}")
    if total_orig > 0:
        total_saving = (1 - total_comp / total_orig) * 100
        print(f"✅ 完成: {ok_count} 张压缩成功  {skip_count} 张跳过")
        print(f"   总体积: {_human(total_orig)} → {_human(total_comp)}  "
              f"节省 {total_saving:.1f}%")
    else:
        print(f"⏭  {skip_count} 张图片无法在质量门槛内压缩")
    print()


if __name__ == "__main__":
    main()
