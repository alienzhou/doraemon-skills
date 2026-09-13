# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10.0"]
# ///

"""抽取视频帧作为封面素材候选，自动过滤纯黑转场帧。

两种模式：
  --interval N        每 N 秒抽一帧（预览用，缩放到 960 宽）
  --timestamps a,b,c  在指定秒数抽全分辨率原图（合成用）
"""

import sys
import json
import shutil
import subprocess
from pathlib import Path


def run_ffmpeg(cmd, timeout=300):
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if out.returncode != 0:
        raise RuntimeError(out.stderr.strip()[:400] or "ffmpeg failed")


def is_blank(path: Path, threshold: int = 12) -> bool:
    """判断是否为纯黑/纯白转场帧——这类帧没有封面价值。"""
    from PIL import Image, ImageStat

    with Image.open(path) as im:
        stat = ImageStat.Stat(im.convert("L"))
        # 标准差极低说明整幅画面几乎同色
        return stat.stddev[0] < threshold


def extract(video: str, outdir: str, interval: int, timestamps, keep_blank: bool):
    if not Path(video).exists():
        raise FileNotFoundError(video)
    if not shutil.which("ffmpeg"):
        raise EnvironmentError("ffmpeg")

    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    produced = []

    if timestamps:
        # 精确抽帧：保留原始分辨率，用于最终合成
        for ts in timestamps:
            dst = out / f"frame_{str(ts).replace('.', '_')}s.png"
            run_ffmpeg([
                "ffmpeg", "-y", "-v", "error", "-ss", str(ts),
                "-i", video, "-frames:v", "1", str(dst),
            ])
            if dst.exists():
                produced.append(dst)
    else:
        # 均匀抽帧：缩放到 960 宽做预览，节省读图开销
        run_ffmpeg([
            "ffmpeg", "-y", "-v", "error", "-i", video,
            "-vf", f"fps=1/{interval},scale=960:-1",
            str(out / "frame_%03d.jpg"),
        ])
        produced = sorted(out.glob("frame_*.jpg"))

    kept, dropped = [], []
    for p in produced:
        if not keep_blank and is_blank(p):
            dropped.append(p.name)
            p.unlink(missing_ok=True)
        else:
            kept.append(str(p))

    return {
        "outdir": str(out),
        "frames": kept,
        "frame_count": len(kept),
        "dropped_blank": dropped,
        "hint": "用 Read 工具逐张查看候选帧，优先选深色底+高饱和主体+元素少的画面",
    }


def main():
    args = sys.argv[1:]
    video = outdir = None
    interval = 6
    timestamps = None
    keep_blank = "--keep-blank" in args

    for i, a in enumerate(args):
        if a == "--video" and i + 1 < len(args):
            video = args[i + 1]
        elif a == "--outdir" and i + 1 < len(args):
            outdir = args[i + 1]
        elif a == "--interval" and i + 1 < len(args):
            interval = int(args[i + 1])
        elif a == "--timestamps" and i + 1 < len(args):
            timestamps = [float(x) for x in args[i + 1].split(",") if x.strip()]

    if not video:
        raise ValueError("--video is required")
    if not outdir:
        outdir = "/tmp/vc_frames"
    if interval <= 0:
        raise ValueError("--interval must be positive")

    return {"data": extract(video, outdir, interval, timestamps, keep_blank)}


def classify_error(e: Exception) -> dict:
    msg = str(e)
    if isinstance(e, FileNotFoundError):
        return {"error": "FILE_NOT_FOUND", "msg": f"视频文件不存在：{msg}"}
    if isinstance(e, EnvironmentError):
        return {
            "error": "FFMPEG_NOT_FOUND",
            "msg": "未找到 ffmpeg，请先安装：brew install ffmpeg",
        }
    if isinstance(e, ImportError):
        return {"error": "DEPENDENCY_MISSING", "msg": "缺少 Pillow，请用 uv run 执行本脚本"}
    if isinstance(e, ValueError):
        return {"error": "BAD_ARGS", "msg": msg}
    if isinstance(e, subprocess.TimeoutExpired):
        return {"error": "EXTRACT_TIMEOUT", "msg": "抽帧超时，请增大 --interval 或改用 --timestamps"}
    if isinstance(e, PermissionError):
        return {"error": "PERMISSION_DENIED", "msg": f"无权限写入输出目录：{msg}"}
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
