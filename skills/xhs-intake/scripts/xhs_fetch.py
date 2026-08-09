#!/usr/bin/env python3
"""小红书笔记抓取器：解析链接 → 判定模态 → 落盘素材 → 输出 manifest.json

用法:
    python3 xhs_fetch.py "<链接或含链接的分享文本>" [-o 输出目录]

行为:
  1. 解析短链 (xhslink.cn) / 长链 (xiaohongshu.com/discovery|explore/item)
  2. 抓 SSR 页面, 提取 window.__INITIAL_STATE__
  3. 判定模态: video / image_text
  4. 落盘: video.mp4 + audio.wav (视频) 或 imgs/NN.jpg (图文)
  5. 写 manifest.json + content.md, 打印 MODALITY 与后续建议

只读公开数据, 不做登录, 不并发轰炸。签名直链有时效, 必须现取现下。
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

UA_PC = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
         "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
UA_MOBILE = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
             "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
REFERER = "https://www.xiaohongshu.com/"


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def extract_url(text):
    m = re.search(r"https?://[^\s一-鿿，。、）)】]+", text)
    if not m:
        sys.exit("ERROR: 输入中未找到 URL")
    return m.group(0).rstrip('"\'')


def resolve(url):
    """短链跳转到最终 note 页, 返回 (final_url, note_id)."""
    req = urllib.request.Request(url, headers={"User-Agent": UA_MOBILE})
    final = urllib.request.urlopen(req, timeout=30).geturl()
    m = re.search(r"/(?:discovery/item|explore|item)/([0-9a-f]{24})", final)
    if not m:
        sys.exit(f"ERROR: 无法从 {final} 提取 noteId")
    return final, m.group(1)


def fetch_html(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA_PC, "Referer": REFERER})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")


def parse_state(html):
    m = re.search(r"window\.__INITIAL_STATE__\s*=\s*(\{.*?\})\s*</script>", html, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(1).replace("undefined", "null"))
    except Exception:
        return None


def pick_note(state, note_id):
    nd = (state.get("note") or {}).get("noteDetailMap") or {}
    entry = nd.get(note_id) or next((v for v in nd.values() if v.get("note")), {})
    return entry.get("note") or {}, entry


def fallback_video_url(html):
    """SSR 解析失败时, 直接从 HTML 正则捞 masterUrl."""
    m = re.search(r'masterUrl":"([^"]+)"', html)
    return m.group(1).encode().decode("unicode_escape") if m else None


def download(url, path, timeout=300):
    req = urllib.request.Request(url, headers={"User-Agent": UA_MOBILE, "Referer": REFERER})
    with urllib.request.urlopen(req, timeout=timeout) as r, open(path, "wb") as f:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)
    return os.path.getsize(path)


def best_video(note):
    """从 note.video 里挑码率最高的 masterUrl。"""
    streams = (((note.get("video") or {}).get("media") or {}).get("stream") or {})
    cands = []
    for key, arr in streams.items():
        for s in arr or []:
            cands.append((s.get("videoBitrate") or 0, s.get("masterUrl"),
                          (s.get("backupUrls") or [None])[0], key))
    cands = [c for c in cands if c[1]]
    if not cands:
        return None, None, None
    cands.sort(reverse=True)
    return cands[0][1], cands[0][2], cands[0][3]


def clean_desc(desc):
    return re.sub(r"\[话题\]#", "#", desc or "").strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="小红书链接或分享文本")
    ap.add_argument("-o", "--out", default=None, help="输出目录, 默认 /tmp/xhs/<noteId>")
    ap.add_argument("--no-audio", action="store_true", help="视频不抽音轨")
    args = ap.parse_args()

    url = extract_url(args.input)
    final, note_id = resolve(url)
    log(f"[1/4] noteId={note_id}")

    out = args.out or f"/tmp/xhs/{note_id}"
    os.makedirs(out, exist_ok=True)

    html = fetch_html(final)
    open(os.path.join(out, "page.html"), "w", encoding="utf-8").write(html)
    state = parse_state(html)
    note, entry = pick_note(state, note_id) if state else ({}, {})

    mtype = note.get("type")
    if not mtype:
        mtype = "video" if ('masterUrl"' in html) else "image_text"
    modality = "video" if mtype == "video" else "image_text"
    log(f"[2/4] modality={modality}")

    user = note.get("user") or {}
    mf = {
        "note_id": note_id,
        "url": final,
        "modality": modality,
        "title": note.get("title") or "",
        "desc": clean_desc(note.get("desc")),
        "author": user.get("nickname") or "",
        "author_id": user.get("userId") or "",
        "publish_time": note.get("time"),
        "publish_time_h": (time.strftime("%Y-%m-%d %H:%M",
                                         time.localtime(note["time"] / 1000))
                           if note.get("time") else ""),
        "ip_location": note.get("ipLocation") or "",
        "tags": [t.get("name") for t in (note.get("tagList") or []) if t.get("name")],
        "interact": note.get("interactInfo") or {},
        "assets": {},
        "fetched_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    if modality == "video":
        murl, burl, tier = best_video(note)
        murl = murl or fallback_video_url(html)
        if not murl:
            sys.exit("ERROR: 未找到视频直链, 可能是私密笔记或页面结构变化")
        vp = os.path.join(out, "video.mp4")
        try:
            size = download(murl, vp)
        except Exception as e:
            log(f"  masterUrl 失败({e}), 尝试 backupUrl")
            size = download(burl, vp)
        mf["assets"]["video"] = {"path": "video.mp4", "bytes": size, "tier": tier}
        log(f"[3/4] video {size/1e6:.1f}MB")

        try:
            dur = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=nw=1:nk=1", vp],
                capture_output=True, text=True).stdout.strip()
            mf["assets"]["video"]["duration_sec"] = float(dur)
        except Exception:
            pass

        if not args.no_audio:
            ap_ = os.path.join(out, "audio.wav")
            subprocess.run(["ffmpeg", "-v", "error", "-i", vp, "-vn", "-ac", "1",
                            "-ar", "16000", "-c:a", "pcm_s16le", ap_, "-y"], check=True)
            mf["assets"]["audio"] = {"path": "audio.wav",
                                     "bytes": os.path.getsize(ap_)}
            log("[3/4] audio.wav ready")
    else:
        imgs_dir = os.path.join(out, "imgs")
        os.makedirs(imgs_dir, exist_ok=True)
        imgs = []
        for i, im in enumerate(note.get("imageList") or []):
            u = im.get("urlDefault") or im.get("urlPre")
            if not u:
                continue
            p = os.path.join(imgs_dir, f"{i:02d}.jpg")
            try:
                size = download(u, p, timeout=60)
            except Exception as e:
                log(f"  img {i} 失败 {e}")
                continue
            imgs.append({"path": f"imgs/{i:02d}.jpg", "bytes": size,
                         "width": im.get("width"), "height": im.get("height")})
        mf["assets"]["images"] = imgs
        log(f"[3/4] {len(imgs)} images")

    comments = ((entry.get("comments") or {}).get("list") or [])
    mf["comments_ssr"] = [
        {"user": (c.get("userInfo") or {}).get("nickname"),
         "content": c.get("content"),
         "like": c.get("likeCount")}
        for c in comments
    ]
    mf["comments_note"] = ("SSR 首屏未含评论, 需浏览器渲染补齐"
                           if not comments else "")

    json.dump(mf, open(os.path.join(out, "manifest.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    md = [f"# {mf['title'] or '(无标题)'}", "",
          f"- 作者: {mf['author']}", f"- 发布: {mf['publish_time_h']} {mf['ip_location']}",
          f"- 模态: {modality}", f"- 标签: {' '.join('#'+t for t in mf['tags'])}",
          f"- 原链: {final}", "", "## 正文 (desc)", "", mf["desc"] or "(空)"]
    open(os.path.join(out, "content.md"), "w", encoding="utf-8").write("\n".join(md))

    log(f"[4/4] done -> {out}")
    print(json.dumps({"out_dir": out, "modality": modality,
                      "note_id": note_id, "title": mf["title"],
                      "desc_len": len(mf["desc"]),
                      "assets": mf["assets"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
