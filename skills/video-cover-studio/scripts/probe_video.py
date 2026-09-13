# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///

"""探测视频基础信息，并给出抽帧间隔建议。"""

import sys
import json
import shutil
import subprocess
from pathlib import Path


def probe(video: str) -> dict:
    if not Path(video).exists():
        raise FileNotFoundError(video)
    if not shutil.which("ffprobe"):
        raise EnvironmentError("ffprobe")

    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size",
        "-show_entries", "stream=width,height,codec_name,r_frame_rate,codec_type",
        "-of", "json", video,
    ]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if out.returncode != 0:
        raise RuntimeError(out.stderr.strip() or "ffprobe failed")

    info = json.loads(out.stdout)
    fmt = info.get("format", {})
    duration = float(fmt.get("duration", 0))

    video_stream = next(
        (s for s in info.get("streams", []) if s.get("codec_type") == "video"), {}
    )

    # 时长决定抽帧密度：短视频抽密一点，长视频抽疏一点
    if duration <= 180:
        interval = 6
    elif duration <= 600:
        interval = 10
    else:
        interval = 15

    return {
        "duration_sec": round(duration, 2),
        "size_bytes": int(fmt.get("size", 0)),
        "width": video_stream.get("width"),
        "height": video_stream.get("height"),
        "codec": video_stream.get("codec_name"),
        "fps": video_stream.get("r_frame_rate"),
        "suggested_interval_sec": interval,
        "estimated_frame_count": int(duration // interval) if interval else 0,
    }


def main():
    args = sys.argv[1:]
    video = None
    for i, a in enumerate(args):
        if a == "--video" and i + 1 < len(args):
            video = args[i + 1]
    if not video:
        raise ValueError("--video is required")
    return {"data": probe(video)}


def classify_error(e: Exception) -> dict:
    msg = str(e)
    if isinstance(e, FileNotFoundError):
        return {"error": "FILE_NOT_FOUND", "msg": f"视频文件不存在：{msg}"}
    if isinstance(e, EnvironmentError):
        return {
            "error": "FFMPEG_NOT_FOUND",
            "msg": "未找到 ffprobe，请先安装 ffmpeg：brew install ffmpeg",
        }
    if isinstance(e, ValueError):
        return {"error": "BAD_ARGS", "msg": msg}
    if isinstance(e, subprocess.TimeoutExpired):
        return {"error": "PROBE_TIMEOUT", "msg": "ffprobe 执行超时，文件可能损坏"}
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
