# 资讯图文制作

作者提供报告或话题；制作时填写 `story.json`，可编辑 `style.css` 和 `build.cjs`。默认数据全部为**虚构排版示例**，请替换内容、来源、日期和文案。

```sh
npm install
npm run build
npm run render
# 打开 output/overview.png、output/thumbnails.png 及每张完整图并审阅
# 写 review.md，确认事实和图片后将 story.json 的 draft 改为 false
npm run build
npm run render
npm run package
```

需要 Node.js、Python 3 和 Chrome/Chromium；找不到浏览器时通过 `CHROME_PATH` 指定。默认系统中文字体；缺少中文字体时先安装或配置可用字体再导出。

源文件：`story.json`、`build.cjs`、`style.css`、`assets/`。图片、预览、QA、ZIP 在 `output/`。`post-copy.md` 和 `sources.md` 由 build 从 JSON 生成，请修改 JSON，避免下一次构建覆盖手工修改。

无需固定黄黑样式：可换 `theme`（editorial / light / night），或改 CSS/组件。主题变体仍需人工审图。
