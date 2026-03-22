---
name: commit-message-zh
description: Generate standardized bilingual (Chinese + English) Git commit messages following Conventional Commits. Use when the user asks to commit, write a commit message, or mentions git commit in Chinese context.
---

# 中英双语 Git Commit Message 生成器

根据代码变更，生成规范的中英双语 Git commit message。

## 格式

```
<type>(<scope>): <英文简述>

<中文详细说明>

<可选的 footer>
```

## Type 列表

| Type | 用途 |
|------|------|
| feat | 新功能 |
| fix | 修复 bug |
| docs | 文档变更 |
| style | 代码格式调整（不影响逻辑） |
| refactor | 重构（既非新功能也非修复） |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建、工具、依赖等杂项 |
| ci | CI/CD 配置变更 |

## 步骤

1. 运行 `git diff --staged` 查看暂存区变更
2. 如果暂存区为空，运行 `git diff` 查看工作区变更
3. 分析变更内容，确定 type 和 scope
4. 用英文写简洁的 subject line（不超过 72 字符，不加句号）
5. 用中文写 body，解释「为什么」要做这个变更
6. 如有关联的 issue，在 footer 中引用

## 示例

```
feat(auth): add OAuth2 login support

新增 OAuth2 登录功能，支持 GitHub 和 Google 第三方登录。
- 使用 passport.js 实现 OAuth2 流程
- 新增登录回调处理逻辑
- 添加 token 刷新机制

Closes #42
```

```
fix(api): handle null response in user query

修复用户查询接口在返回 null 时的崩溃问题。
- 添加空值检查
- 返回合理的默认值而非抛出异常
```

## 注意事项

- Subject line 使用英文，用祈使语气（add 而非 added/adds）
- Body 使用中文，重点解释「为什么」而非「做了什么」
- 每行不超过 72 字符
- Subject 和 body 之间空一行
