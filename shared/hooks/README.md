# Shared Hooks

> **Status**: 初始提取，尚未完全参数化。目前保留的是 discuss-for-specs 版本的代码。

## 背景

`discuss-for-specs` 和 `agent-better-checkpoint` 两个项目共享了一套 hooks 基础设施（`common/` 目录），在原来的独立仓库中是各自复制了一份。

## 当前结构

```
shared/hooks/
├── common/                    # 共享工具模块
│   ├── __init__.py
│   ├── file_utils.py         # 文件操作工具
│   ├── logging_utils.py      # 日志工具（含路径配置）
│   ├── meta_parser.py        # YAML 元数据解析
│   ├── platform_utils.py     # 跨平台工具
│   └── snapshot_manager.py   # 快照管理
├── install.py                # 安装脚本
├── post-response/            # post-response hook
│   └── __init__.py
└── stop/                     # stop hook
    ├── __init__.py
    └── check_precipitation.py
```

## TODO

- [ ] 将 `logging_utils.py` 中的硬编码路径（如 `.vibe-x/discuss-for-specs/`）参数化
- [ ] 让 `packages/discuss-for-specs` 和 `packages/agent-better-checkpoint` 引用此共享模块
- [ ] 统一两个项目的 hooks 构建流程
