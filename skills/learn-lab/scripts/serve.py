#!/usr/bin/env python3
"""起一个本地静态服务，供浏览器工具实测课件。

浏览器自动化工具通常拒绝 file:// 协议（Navigating to local URL is not allowed），
所以必须走 http。

用法：
    python3 serve.py /absolute/path/output-dir [--port 8777]

默认自动挑一个空闲端口并打印完整 URL。按 Ctrl-C 停止。
"""
import argparse
import contextlib
import functools
import http.server
import socket
import socketserver
import sys
from pathlib import Path
from typing import Optional


def free_port(preferred: Optional[int] = None) -> int:
    if preferred:
        with contextlib.closing(socket.socket()) as s:
            try:
                s.bind(("127.0.0.1", preferred))
                return preferred
            except OSError:
                print(f"端口 {preferred} 被占用，改用随机端口", file=sys.stderr)
    with contextlib.closing(socket.socket()) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def main() -> int:
    ap = argparse.ArgumentParser(description="为 learn-lab 课件起本地服务")
    ap.add_argument("dir", help="课件所在目录的绝对路径")
    ap.add_argument("--port", type=int, default=None, help="指定端口，默认自动选")
    args = ap.parse_args()

    root = Path(args.dir).expanduser().resolve()
    if not root.is_dir():
        print(f"目录不存在：{root}", file=sys.stderr)
        return 1
    index = root / "index.html"
    if not index.exists():
        print(f"警告：{index} 不存在", file=sys.stderr)

    port = free_port(args.port)
    handler = functools.partial(QuietHandler, directory=str(root))

    class Reusable(socketserver.TCPServer):
        allow_reuse_address = True

    url = f"http://127.0.0.1:{port}/index.html"
    with Reusable(("127.0.0.1", port), handler) as httpd:
        print(f"服务目录：{root}")
        print(f"打开地址：{url}")
        print()
        print("浏览器实测：")
        print(f'  myflicker-browser new_tab --url "{url}"')
        print("  myflicker-browser console_messages --tab-id <tabId> --limit 40")
        skill = Path(__file__).resolve().parent.parent
        print(f'  myflicker-browser evaluate --tab-id <tabId> \\')
        print(f'    --expression-file "{skill / "scripts" / "pedagogy-check.js"}" --timeout-ms 60000')
        print("  myflicker-browser screenshot --tab-id <tabId>")
        print()
        print("脚本只验证结构性属性 —— 必须另外截图人看")
        print("Ctrl-C 停止")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n已停止")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
