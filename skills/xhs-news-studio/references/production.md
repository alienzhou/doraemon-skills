# 生产与数据格式

## 环境与入口

技能的 `scripts/scaffold.py` 使用 Python 3 标准库，不需要安装 Python 依赖。新建目录时复制 `assets/starter/`，遇到已有目录会拒绝覆盖。生成的项目独立安装 `puppeteer-core`；Chrome/Chromium 路径自动检查 macOS/Linux/Windows 的常见位置，失败时设置 `CHROME_PATH`。字体默认 PingFang SC / Noto Sans CJK SC / Microsoft YaHei；跨机器要检查中文实际渲染。

```sh
python3 "/path/to/xhs-news-studio/scripts/scaffold.py" "/workspace/new-topic"
cd "/workspace/new-topic"
npm install
npm run build
npm run render
```

包版本为本技能验证时所用版本，不表示永远最新。新环境安装出现不兼容时按错误修正依赖并重新验证，不主动升级全部工具。

`npm run render` 是本地 HTML→PNG 制作流程，不是操作用户浏览器。需要在用户浏览器展示或检查页面时，使用当前环境提供的浏览器工具。查看本地图可用 image viewer。跨工具具体 API 以当前工具文档为准。

## 填写 story.json

这是供参考执行方式使用的起点，不是必须服从的数据标准。自由设计可另写组件/数据结构，仍需覆盖相同交付和验收。

| 字段 | 含义 |
|---|---|
| draft | 初始 true；示例/未完成内容不要解除。事实核对和视觉审查完成后设 false，再 build/render |
| maxImages | 发布图片上限，含封面；starter 默认 18，可通过 scaffold 的 `--max-images` 或数据调整。这是可配置创作约束，不是平台永久规格 |
| renderInputs | 可选相对路径数组：自定义图形模块、数据、素材清单等额外输入；加入 render 的哈希检查，避免改模块后打包旧图 |
| date | 本次资料截止日期，YYYY-MM-DD；不是把今天当成产品发布日期 |
| theme | editorial（参考黄/奶油）、light、night；后两者是起始配色，非认可案例 |
| brand / topic | 栏目和当前话题；不继承旧栏目日期或旧产品名 |
| cover.badge / title / hook | 新闻标签、主体名、第三层看点；支持换行 `\n`，不支持任意 HTML |
| cover.hookIsQuestion / answerPage | 是否是提问钩子；答案页为含封面的 1-based 页码（3=第三张） |
| cover.hero | 项目内的相对图片路径，留空可做纯文字封面；不能引用项目外路径或远程图片 |
| cover.tone | 有图片时必填 dark 或 light，决定文字配色；根据真实背景明暗选择，不能只跟随内页主题 |
| cover.heroAlt / assetNote | 主视觉描述及“概念插画/实测截图”等出处性质说明 |
| caption | title、paragraphs 数组、tags 数组（不带 #）。build 生成 post-copy.md |
| sources | id、title、type、url、note；可加 published、checked。type 如 official/eval/personal/report，虚构样例用 synthetic |
| pages | 不含封面。每页 kind、section、title、summary、sourceIds；根据类型填写下面的字段 |

本次图片上限写进 brief，`maxImages` 与其一致；build/package 按**含封面的实际发布列表**校验。自由设计采用其它字段或结构时同步实现这项检查，仅写字段不算执行。要求全量亮点时，另存简短覆盖表并连接到真实页码，build 的 ID/页码检查不能代替编辑验收。

有来源的本地报告也能用：url 字段填报告文件名/路径并在 note 写页码和提取范围；报告外发包含隐私内容时不要把原文件打入 ZIP。sources.md 默认只提供定位信息。跨设备分享时给读者可访问的公共原链接，或明确这是用户提供的本地资料。

### 各页类型

- `facts` / `takeaway`：`items: [{label, body}]`，适合时间、用途、状态、线索。
- `metrics`：`scores: [{label,value,passed,total}]`；格子可选，total 为 1–100 的整数。`chart: {title,unit,direction,max,rows}`；direction 为 higher/lower，rows 每行 label、detail、value、highlight。横轴 0 起；条宽按 value/max 算。`method` 写测试口径。传入数据必须已核实，脚本不懂指标语义。
- `community`：`cases: [{task,result,author,sourceId}]`，先写任务结果；`early: {title,body}` 可选，用于早期体验。短页不必塞三例。

所有页面引用的来源 ID 必须存在。数字、来源细节和摘要放在一处维护。**post-copy.md / sources.md 为生成文件，应改 JSON 而非只改 Markdown**。长标题和长来源可能超版，裁剪事实或重排，不能盲目缩字。

## 生图和图层

推荐把新素材保存到项目 `assets/`。用户提供现成图先查看再决定如何使用。使用当前 imagegen 能力时遵守其技能与工具说明；未能生成素材也继续完成可用版式。封面上主题名与新闻标签是 HTML；图中的字不能依赖事后 OCR 修错。

生成的资产必须在原图和实际封面中查看。改图用提供的图像编辑工具；无需改动图片时直接复制，不额外重绘。图片可用作背景，但其留白要真实满足标题布局。

真实素材保存在项目内，并记录本地文件、原始页面、图片 URL 或截图位置、素材类型、图中展示内容与核对日期；下载素材可用 `assets/manifest.json` 集中维护，避免来源散落在临时脚本中。原图与排版裁切分开保存，图注从同一记录生成或核对。每个实际使用的素材都要打开查看；网页 `<img>` 能加载不证明画面与正文相关。

## 输出、审查与打包

- build：逐页 HTML、index.html、pages.json、post-copy.md、sources.md。
- render：每页 1080×1440 PNG、overview.png、240px 页面缩略图、qa.json。
- 先打开完整图与缩略图，核对资料，写实际 `review.md`。
- 正式稿 `draft:false`，重新 build/render 后 `npm run package`。
- package：拒绝 draft/synthetic、失败 QA、陈旧的源文件/PNG、缺少审阅记录；成功生成 `output/publish.zip` 和 SHA-256 manifest，并逐文件比对 ZIP。

QA 记录源文件和素材哈希，因此改 JSON、CSS、HTML、图片、渲染脚本或文案后都要重新生成。只修改 review.md 不会使图失效。package 不验证事实真实性、审美或“review.md 是否诚实”；这些由直接读资料和打开图片保证。

新增自定义图形模块、数据文件或素材清单时，把它们加入 `renderInputs`；自由设计采用其它机制也要覆盖实际构建/审查依赖，别让固定文件列表漏检。发布包只放选定顺序的图片和发布所需文档；可编辑源包另保留数据、样式、组件、已用素材、图源及复现命令。

若用自由设计做了其它尺寸/文件名/组件，请同步修改 render 的画布尺寸、页面列表和对应检测，再查看真实导出。不要只改尺寸常量就宣称其它平台效果已经验证。

## 推荐工作文件

`brief.md`：制作决策与来源缺口。`story.json`：可发布内容。`assets/`：素材。`review.md`：实际验收。`output/`：生成物。需要保存原始片段时放独立 research 目录并按隐私与体积决定是否保留；不把下载缓存和全部视频字幕打包给读者。

## 用户要求清理时

先确认哪一版已获认可，再在本任务目录内清理旧版图片、备用封面、一次性脚本、缓存和过期包。不要扩大成整理整个工作区或技能库，也不要仅因文件夹名像旧版就整目录删除。

删除前检查最终版的相对引用、符号链接、预览服务目录、打包清单和重建命令：`node_modules` 可能链接到旧目录，图源或数据也可能仍在其中。先把有效依赖迁入最终目录或改成可独立安装，再删旧目录；仅终止明确属于旧预览的进程。保留最终发布图、源文件、已用素材、必要证据、审查记录及复现所需依赖说明。删除仍在 QA 哈希或打包清单中的文件时，同步清单并重新验证，不能把坏掉的复现能力称为“只留最终版”。

## 常见故障

| 现象 | 处理 |
|---|---|
| 找不到 Chrome | 检查已安装路径，设置 CHROME_PATH；不自动更改系统安全配置 |
| 中文成方框 | 选机器已有中文字体，必要时安装明确来源字体；重新截图查看 |
| 标题换行/压图 | 调整文本长度、位置与图片留白，少量改字距或字号 |
| 页脚间距不足 | 删重复句、减次要块或拆页，先不缩正文 |
| 柱形图很长但结论是“弱” | 检查单位/指标方向；耗时和效果分开 |
| 模型只做了说明文档 | 继续运行生成/渲染，拿到可用图片后再交付 |
| 无法访问社区原帖 | 标明镜像或省略该例，用已核对案例补位，不杜撰实测 |
| 浏览器还显示旧图 | 更新预览 URL 版本或刷新；确认 PNG 与 ZIP 同步 |
