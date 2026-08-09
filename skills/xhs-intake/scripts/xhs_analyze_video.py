#!/usr/bin/env python3
"""视频素材分析器：ASR 转录 + 均匀抽帧 + 关键帧(场景切换)抽取

用法:
    python3 xhs_analyze_video.py <out_dir> [--fps-interval 15] [--no-asr] [--scene 0.3]

产出 (写入 out_dir):
    transcript.txt   带时间戳的转录
    transcript.plain 纯文本
    frames/NNN_<秒>.jpg  均匀抽帧
    keyframes/*.jpg      场景切换关键帧
    analyze.json         元信息 (供 agent 读取)
"""
import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys

MLX_MODEL = "mlx-community/whisper-large-v3-turbo"


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", path], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


def run_asr(audio, out_dir, lang="zh"):
    """优先 mlx_whisper (Apple 芯片, 快), 回退 openai-whisper。"""
    if shutil.which("mlx_whisper"):
        cmd = ["mlx_whisper", audio, "--model", MLX_MODEL, "--language", lang,
               "--output-dir", out_dir, "--output-format", "all"]
    elif shutil.which("whisper"):
        cmd = ["whisper", audio, "--model", "medium", "--language", lang,
               "--output_dir", out_dir, "--output_format", "all"]
    else:
        log("WARN: 未找到 mlx_whisper / whisper, 跳过 ASR")
        return None
    log("ASR:", " ".join(cmd[:3]), "...")
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
    base = os.path.splitext(os.path.basename(audio))[0]
    return os.path.join(out_dir, base + ".txt")


def srt_to_plain(srt_path):
    if not (srt_path and os.path.exists(srt_path)):
        return ""
    lines = []
    for ln in open(srt_path, encoding="utf-8"):
        ln = ln.strip()
        if not ln or ln.isdigit() or "-->" in ln:
            continue
        lines.append(ln)
    return "".join(lines)


def uniform_frames(video, out_dir, interval):
    fd = os.path.join(out_dir, "frames")
    os.makedirs(fd, exist_ok=True)
    for f in glob.glob(fd + "/*.jpg"):
        os.remove(f)
    subprocess.run(["ffmpeg", "-v", "error", "-i", video,
                    "-vf", f"fps=1/{interval},scale=960:-2",
                    "-q:v", "4", os.path.join(fd, "%03d.jpg"), "-y"], check=True)
    files = sorted(glob.glob(fd + "/*.jpg"))
    # 重命名带上秒数, 方便和 transcript 时间轴对齐
    out = []
    for i, f in enumerate(files):
        sec = int(i * interval)
        new = os.path.join(fd, f"{i:03d}_{sec:05d}s.jpg")
        os.rename(f, new)
        out.append({"path": os.path.relpath(new, out_dir), "sec": sec})
    return out


def scene_frames(video, out_dir, thresh):
    kd = os.path.join(out_dir, "keyframes")
    os.makedirs(kd, exist_ok=True)
    for f in glob.glob(kd + "/*.jpg"):
        os.remove(f)
    subprocess.run(["ffmpeg", "-v", "error", "-i", video,
                    "-vf", f"select='gt(scene,{thresh})',scale=960:-2",
                    "-vsync", "vfr", "-q:v", "4",
                    os.path.join(kd, "kf%03d.jpg"), "-y"], check=True)
    return [os.path.relpath(f, out_dir) for f in sorted(glob.glob(kd + "/*.jpg"))]


def visual_variance(frames_meta, out_dir):
    """相邻帧平均差异度, 用于判断画面是否承载信息。无 PIL 时返回 None。"""
    try:
        from PIL import Image, ImageChops, ImageStat
    except ImportError:
        return None
    prev, diffs = None, []
    for fm in frames_meta:
        try:
            im = Image.open(os.path.join(out_dir, fm["path"])).convert("L").resize((160, 90))
        except Exception:
            continue
        if prev is not None:
            diffs.append(ImageStat.Stat(ImageChops.difference(prev, im)).mean[0])
        prev = im
    return round(sum(diffs) / len(diffs), 2) if diffs else None


def classify(res):
    """按语音密度 + 画面变化度给出子类建议。"""
    dur = res.get("duration_sec") or 0
    chars = res.get("transcript_chars")
    density = round(chars / dur, 2) if (chars and dur) else None
    res["speech_chars_per_sec"] = density
    vv = res.get("visual_variance")
    if density is not None and density < 0.5:
        sub = "1c_visual_only"      # 几乎无人声, 纯画面展示
    elif vv is not None and vv < 3.0:
        sub = "1b_audio_driven"     # 有人声, 画面几乎静止 (口播/固定背景)
    else:
        sub = "1a_audio_visual"     # 音画都有信息
    res["subtype"] = sub
    res["subtype_hint"] = {
        "1a_audio_visual": "音画都有信息: 读 transcript + 逐帧读图, 二者交叉引用",
        "1b_audio_driven": "画面静止: 以 transcript 为主, 仅抽查 2-3 帧确认无字幕外信息",
        "1c_visual_only": "几乎无人声: 以逐帧读图为主, transcript 仅作补充",
    }[sub]
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out_dir")
    ap.add_argument("--fps-interval", type=int, default=15, help="均匀抽帧间隔秒")
    ap.add_argument("--scene", type=float, default=0.3, help="场景切换阈值")
    ap.add_argument("--no-asr", action="store_true")
    ap.add_argument("--no-frames", action="store_true")
    ap.add_argument("--lang", default="zh")
    args = ap.parse_args()

    od = args.out_dir
    video = os.path.join(od, "video.mp4")
    audio = os.path.join(od, "audio.wav")
    if not os.path.exists(video):
        sys.exit(f"ERROR: {video} 不存在, 先跑 xhs_fetch.py")

    res = {"duration_sec": duration(video)}

    if not args.no_asr and os.path.exists(audio):
        txt = run_asr(audio, od, args.lang)
        if txt and os.path.exists(txt):
            shutil.copy(txt, os.path.join(od, "transcript.txt"))
            srt = os.path.splitext(txt)[0] + ".srt"
            plain = srt_to_plain(srt) or open(txt, encoding="utf-8").read()
            plain = re.sub(r"\[\d+:\d+\.\d+ --> \d+:\d+\.\d+\]\s*", "", plain)
            open(os.path.join(od, "transcript.plain"), "w",
                 encoding="utf-8").write(plain)
            res["transcript_chars"] = len(plain)
            res["transcript"] = "transcript.txt"

    if not args.no_frames:
        res["frames"] = uniform_frames(video, od, args.fps_interval)
        res["keyframes"] = scene_frames(video, od, args.scene)
        res["frame_interval_sec"] = args.fps_interval
        res["visual_variance"] = visual_variance(res["frames"], od)

    classify(res)

    json.dump(res, open(os.path.join(od, "analyze.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(json.dumps({k: (len(v) if isinstance(v, list) else v)
                      for k, v in res.items()}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
