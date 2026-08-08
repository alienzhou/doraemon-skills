#!/usr/bin/env python3
"""评测指标：PSNR / SSIM / BPP，纯 numpy + PIL,无需 skimage。

评判标准：
  - ssim   : 结构相似度 [0,1]，与人眼感知最相关，是「画质」主指标。
  - psnr   : 峰值信噪比 dB，辅助参考。
  - bpp    : bits per pixel = 文件bit数 / 像素数，跨分辨率可比的「体积密度」。
  - 一张图的「好」= 在 ssim 达标(≥门槛)的前提下 bpp 越低越好。
"""
import numpy as np
from PIL import Image


def load_rgb(path):
    img = Image.open(path)
    has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
    return np.asarray(img.convert("RGB"), dtype=np.float64), has_alpha


def psnr(a, b):
    mse = np.mean((a - b) ** 2)
    return float("inf") if mse == 0 else 20 * np.log10(255.0) - 10 * np.log10(mse)


def _ssim_channel(x, y, win=7, C1=(0.01 * 255) ** 2, C2=(0.03 * 255) ** 2):
    from numpy.lib.stride_tricks import sliding_window_view

    def m(v):
        pad = win // 2
        w = sliding_window_view(np.pad(v, pad, mode="reflect"), (win, win))
        return w.mean(axis=(-1, -2))

    mx, my = m(x), m(y)
    mx2, my2, mxy = m(x * x), m(y * y), m(x * y)
    vx, vy, cov = mx2 - mx ** 2, my2 - my ** 2, mxy - mx * my
    smap = ((2 * mx * my + C1) * (2 * cov + C2)) / ((mx ** 2 + my ** 2 + C1) * (vx + vy + C2))
    return float(smap.mean())


def ssim(a, b):
    return float(np.mean([_ssim_channel(a[..., c], b[..., c]) for c in range(a.shape[-1])]))


def bpp(path, pixels):
    import os
    return os.path.getsize(path) * 8.0 / pixels


def evaluate(orig_path, comp_path, lossless=False):
    """返回该压缩结果 vs 原图的完整指标 dict。"""
    a, had_alpha = load_rgb(orig_path)
    h, w = a.shape[:2]
    pixels = h * w
    if lossless:
        return {"psnr": float("inf"), "ssim": 1.0, "bpp": bpp(comp_path, pixels),
                "pixels": pixels, "had_alpha": had_alpha}
    b, _ = load_rgb(comp_path)
    if a.shape != b.shape:
        return {"error": f"尺寸不一致 {a.shape} vs {b.shape}"}
    return {"psnr": psnr(a, b), "ssim": ssim(a, b), "bpp": bpp(comp_path, pixels),
            "pixels": pixels, "had_alpha": had_alpha}
