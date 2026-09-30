# 实机取证与上传链路踩坑库

> 每一条都是真实踩过的。动手前扫一遍，能省一到两小时。
>
> 第一、二节（Computer Use 与 macOS 截图）**与平台无关**，任何 GUI 自动化取证都适用。
> 第三、四节是上传与建任务环节的通用坑，具体命令按你的平台替换。

## 一、Computer Use 操作 Electron 类客户端

### 1. AX 树懒加载 —— observe 只返回 "genuine AX shell"

**现象**：`cu observe` 拿到的窗口只有 OCR / pictureOnly，没有任何语义节点，无法用 `@e` ref 操作。

**根因**：Cursor / VSCode 系是 Electron，辅助功能树按需构建，窗口静置时不建树。

**解法**：先用**坐标**点击输入框，再 `typeText` 敲入任意字符——键入动作会触发 AX 树建立，之后重新 `observe` 就能拿到完整语义节点。

```
cu act click --x <输入框x> --y <输入框y>
cu act typeText --text "/"
cu observe   # 这时才有真树
```

必要时给 `cu observe` 加 `--allow-activation`。

### 2. ref 编号跨轮漂移

**现象**：上一轮记下的 `@e102`，这一轮指向了完全不相干的元素（甚至别的应用窗口）。

**解法**：**每次操作前重新 `cu find-roots --app <名> && cu observe` 取新 stateId**，绝不跨轮复用旧 ref。stateId 也绝不写进任何持久化位置。

### 3. `unknown` 结果绝不重试

`click` / `drag` 返回 `unknown` 时动作**可能已经生效**，重试会造成双击提交等不可逆后果。正确做法是重新 `observe` 看当前状态，再决定下一步。退出码 `2`（stale_state）不可重放。

### 3.1 有些竞品是**真·AX shell**，只能走视觉 + 坐标

**现象**：对 ChatGPT.app 反复 `--allow-activation` + 键入触发都建不出树，`observe` 每次自动 `upgraded to visual evidence (ax_shell)`，所有节点带 `[pictureOnly]`（来自 OCR）。

**结论**：这类应用**没有懒加载可言，就是不暴露 AX**。不要在「触发建树」上耗时间，直接接受：

- 动作只能用**坐标**（`click --x --y`），ref 动作一律不可用；
- 坐标动作要求本次 observe 捕获了图像，否则报 `coordinate actions require an observation that captured an image`——用 `--mode fused` 或 `visual`；
- **产品文档里如实写「本次无辅助功能树第二路证据，结论全部来自视觉截图」**，不要编造 AX role/value 充数。

对照：Cursor 是 Electron，有真树（懒加载，见第 1 条）；ChatGPT 是 AX shell，没有。动手前先 observe 一次看它属于哪类，再决定取证策略。

### 3.2 Agent 任务太短，抓不到「运行中」态

**现象**：想截 Agent 运行态，发了个只读任务，9 秒就跑完（`Worked for 9s`），等切窗口过去已经结束了。

**解法**：取证前先设计一个**足够长的只读任务**（例：「逐个读取 skills 目录下每一个子目录里的 SKILL.md」），保证有几十秒的运行窗口够你 observe + 截图。只读任务同时满足「不产生持久数据」的还原要求。

### 3.3 AX 树被**安全水印**填满 —— 语义节点全是时间戳

**现象**（某企业版客户端）：`cu observe` 返回的树里满屏都是

```
@eN AXStaticText value="<域账号> - 2026/09/03 11:57:03"
```

真正的界面节点被这些水印节点淹没，`search` 也找不到有效元素。

**根因**：企业客户端叠了全屏防泄密水印图层，水印本身是大量 AXStaticText。

**解法**：判定为「只能走视觉 + 坐标」（同 3.1）。但注意——**水印是动态的，弹窗态与列表态的树密度不一样**：实测在弹窗打开时树完全不可用，弹窗态稳定后重新 observe 反而拿到了干净的语义树（`AXApplicationDialog` / `AXTextField` / `AXPopUpButton` 全在）。

所以：**别一次 observe 失败就永久放弃 AX**，换个界面状态再试一次，语义 ref 比坐标可靠得多。

> 附带一条纪律：这类水印里往往带着**当前登录者的账号和时间戳**。取证截图进文档、尤其要外发时，先检查图里有没有水印、账号、邮箱、内部项目名——该裁的裁，该打码的打码。

### 3.4 坐标点击持续 `ambiguous` 时，改走**键盘快捷键**

**现象**：同一个按钮连续多次 `click` 都返回 `outcome: unknown / ambiguous`，而铁律要求不能重试，陷入死循环。

**解法**：换输入通道。实测展开侧栏就是坐标点击反复失败、改按 `Cmd+B` 一次成功。

```bash
cu act --state-id "$S" --actions '[{"kind":"keypress","keys":["cmd","b"]}]'
```

注意 `keypress` 的字段名是 **`keys`（数组）**，不是 `key`；传 `key` 会直接报 `unknown field(s)`。

### 3.5 stateId 有 **120 秒 turn 上限**，且不因活动续期

**现象**：`state S126 is no longer valid: the turn it belonged to expired (turns are capped at 120s, and the cap does not renew on activity)`。

**根因**：stateId 属于一个 turn，turn 从创建起 120 秒硬过期——**期间一直在操作也不会续**。分成「先 observe 看树 → 思考 → 再 act」两条命令时极易超时。

**解法**：把 `observe` 取 stateId 和 `act` **串在同一条 bash 命令里**。

```bash
OUT=$(cu observe --root @r1 --mode fused --allow-activation 2>&1)
S=$(echo "$OUT" | grep -oE 'Use stateId S[0-9]+' | grep -oE 'S[0-9]+')
REF=$(echo "$OUT" | grep 'AXButton$' | head -1 | grep -oE '@e[0-9]+')
cu act --state-id "$S" --actions "[{\"kind\":\"click\",\"ref\":\"$REF\"}]"
```

注意 stateId 要从**末行 `Use stateId SNNN`** 取，不要从首行 `stateId:` 取——两者可能不同（act 后会推进）。

另外 `root @rN` 同样不跨轮存活，报 `root @r2 is not currently available` 就重新 `cu find-roots`。

## 二、macOS 截图

### 3.6 系统自动锁屏会**中途掐断**取证，且无法自动恢复

**现象**：打开竞品的诊断面板后正准备截图，`screencapture` 抓到的是**锁屏壁纸**。之后 `osascript ... get name of every window` 返回空，`cu observe` 只剩菜单栏，窗口节点全消失。

**根因**：macOS 自动锁屏。解锁需 Touch ID 或密码，**Agent 无法自绕**（也不该尝试）。

**解法**：

- 取证前先确认还有多少空闲时间：`defaults -currentHost read com.apple.screensaver idleTime`；
- **把「最关键的那一两张图」放在取证序列最前面**，不要留到最后；
- 已经锁了就**别硬等**——`cu observe --mode ax` 在锁屏下仍能拿到**菜单栏**（AXMenuBar 不受锁屏影响），菜单结构本身常常就是很硬的证据（实测靠 `AXMenuItem "诊断工具"` 这一组菜单原文就支撑了一整条需求）；
- 文档里**如实分级标注**：哪些是实机 AX 原文、哪些退化成了官方 Changelog 原文，不要用后者假装前者。

> 顺带一条：菜单栏是个被低估的取证面。竞品把哪些自助入口放进「帮助」菜单、按什么顺序排，直接暴露了它的产品动线设计。`cu observe --mode ax` 一把就能拿全，还不受懒加载和水印影响。

### 3.7 菜单项常常「有 ref 但无几何」，要走 `osascript` 点

**现象**：`cu act --actions '[{"kind":"click","ref":"@e71"}]'` 报 `element has no usable geometry; cannot compute a click point`——菜单没展开时子项没有屏幕坐标。

**解法**：菜单类操作直接交给 `osascript`，比先点父菜单再点子项稳。

```bash
osascript -e 'tell application "<App>" to activate' -e 'delay 1.2' \
  -e 'tell application "System Events" to tell process "<App>" \
      to click menu item "诊断工具" of menu 1 of menu bar item "帮助" of menu bar 1'
```

注意 Electron 应用的 **process 名可能是 `Electron`** 而不是 App 名（报错信息里会写 `of application process Electron`），但用 App 名寻址通常仍然可用。

另外 `cu act` 可能报 `failed to bring the target application to the foreground; HID events would land on another app`——先 `osascript ... activate` + `delay` 再重试。

### 4. 竞品窗口在外接显示器 → 全屏截图抓错东西

**现象**：`screencapture -x` 抓到的是主屏前台的另一个应用，连抓两次都不对。

**根因**：外接显示器在主屏左侧/上方时，窗口坐标为**负值**（如 `-192, -1080, 1920, 1080`）。全屏截图只覆盖主屏。

**解法**：先取窗口几何，再区域截图。

```bash
osascript -e 'tell application "System Events" to tell process "<AppName>" to get {position, size} of window "<窗口标题>"'
# → -192, -1080, 1920, 1080
screencapture -x -R-192,-1080,1920,1080 out.png
```

窗口标题取不到时不要试 `window 1`（常报无效索引），也不要试 `AXWindowNumber`（常返回空，导致 `screencapture -l` 报 "no file specified"）。用**窗口名**最稳。

**`window 1` 未必是主窗口**：ChatGPT.app 上 `window 1` 返回 `0, 0, 1728, 33`（一个 33px 高的辅助窗），真正主窗是 `0, 33, 1728, 1084`。稳妥做法是列出**全部窗口**再挑面积最大的那个：

```bash
osascript -e 'tell application "System Events" to tell process "ChatGPT" to get {name, position, size} of every window'
```

> `import Quartz` 走 PyObjC 取窗口列表这条路在系统 python3 上不通（ModuleNotFoundError），别浪费时间。

### 5. 前台被抢占

**现象**：区域截图抓到的是同样在那块屏幕上的另一个窗口。

**解法**：**每次截图前**强制激活目标应用并留出渲染时间。

```bash
osascript -e 'tell application "<AppName>" to activate' -e 'delay 1.5'
```

### 6. 界面残留污染

截图前先 `observe` 检查有没有上一轮遗留的状态（残留徽标、系统通知横幅、未关闭的弹窗）。有就先清干净再开始正式取证，否则截出来的「初始态」是脏的。

### 7. Retina 全屏图看不清

区域截图在 Retina 下输出 2 倍尺寸（1920x1080 → 3840x2160），但关键元素仍然很小。用 `sips` 裁剪出关键区域另存：

```bash
sips -c <高> <宽> --cropOffset <y偏移> <x偏移> in.png --out crop.png
```

文档里放裁剪图，不放全屏图。

### 7.0 Retina 下 `--cropOffset` 必须按 **2x** 换算

**现象**：按肉眼在 1000px 缩略图上量的坐标写 `sips -c 1300 1560 --cropOffset 60 380`，裁出来是一片空白。

**根因**：`screencapture` 在 Retina 下输出的是 **2 倍像素**（如逻辑 1728x1117 → 实际 3456x2234），而 `-c` 的高宽与 `--cropOffset` 的 y/x **都按实际像素算**。拿缩略图或逻辑坐标直接填必然偏。

**解法**：先确认实际像素，再把量到的逻辑坐标 ×2。

```bash
sips -g pixelWidth -g pixelHeight full.png     # 先看实际尺寸
sips -c 1300 1560 --cropOffset 880 400 full.png --out crop.png   # y x 均已 ×2
```

裁完**务必 Read 一眼确认**内容对，别裁到空白直接进文档。

### 7.0.1 裁剪同时是**脱敏**的主要手段

截图里最容易夹带的四类东西：**登录账号 / 邮箱**（侧栏底部、账户菜单）、**安全水印**（见 3.3）、**本地仓库与项目名**（侧栏项目列表、窗口标题）、**历史会话标题**（侧栏列表）。

这些在内部流转时无所谓，一旦文档要外发、进公开仓库或贴进对外材料就是事故。所以：

- **裁剪优先**——把关键区域裁出来，顺手就把侧栏、账户区、标题栏切掉了，比事后打码干净；
- 必须保留整屏时，`sips` 裁不掉的再用打码；
- **截完回看一眼**再进文档。Read 一次图片，专门扫一遍四个角和侧栏。

### 7.1 本机装不了竞品客户端时，用**官方产品截图**兜底

**现象**：功能官方标注在 iOS / 另一个桌面客户端，本机没装、也不该为取证去装。

**解法**：走官方图床。官方文档站的产品截图常是 webp，`curl` 下来 `sips -s format png` 转换后再 `sips -c` 裁剪即可，分辨率通常足够（3600x2026）。

```bash
curl -sL -o x.webp "https://<官方文档站>/images/.../xxx-light.webp"
sips -s format png x.webp --out x.png
```

配套两条硬要求：

- **文档里明确标注哪几张是官方物料、哪几张是本机实机**，不能混为一谈；
- 补一张**本机同类界面的对照图**（「改造前长什么样」），让读者能自己做差分。

### 7.2 竞品开源时，**官方仓库的 UI 快照测试 > 截图**

**适用**：竞品在 GitHub 开源（如 `openai/codex`），尤其功能形态是 **TUI / CLI 时根本没有可截的 GUI**。

**做法**：`gh` 直连官方仓库，顺着 changelog 里的 PR 号往下扒。

```bash
gh pr view <PR号> --repo openai/codex --json title,body,files   # body 常有官方 What changed
gh api "repos/openai/codex/contents/<path>?ref=<tag>" -q .content | base64 -d
```

**为什么这是更强的证据**：Rust 项目普遍用 `insta` 做快照测试，`*.snap` 文件里存的是 TUI **逐字符渲染结果**——它不是截图的近似，**它就是程序输出本身**，可直接放进产品文档的代码块。同一 PR 的源码与注释还能佐证「为什么这么设计」，比看图猜意图强得多。

> 实测收益：某次靠源码注释把「编辑待发送消息」的语义确认为 `pop back into the composer`（出队 + 回填输入框），方案因此从「做个行内编辑器」缩成「加个按钮 + 回填」。这是只看截图得不出来的。

配套要求：

- 引用时**注明 `ref=<tag>` 与文件名**，让读者能自己复核；
- 文档头「取证方式说明」里**如实写明本条无实机截图及原因**（形态为 TUI / 本机未装），不要假装做了实机；
- 不要为了取证去安装竞品 CLI 并消耗其额度——与「现场必须还原」的精神一致。

### 7.3 每条竞品需求都应和**自己的现有实现**逐项对照

竞品做法只回答「他们怎么做」，读者真正要的是「我们现在什么样、差在哪」。落笔前先 `grep` 出自己这边对应的组件与文案（一个好用的入口：先在 i18n 文案文件里搜关键词，再反查引用它的组件），把现状原文抄进「一、解决什么问题」。**没有现状对照的竞品文档会被读成「为了抄而抄」。**

## 三、文档上传

> 以下是上传链路的**通用坑**，命令按你的<文档平台>替换。

### 8. 认证分域，主命令能登不代表子域能用

**现象**：主 CLI `auth login` 成功，但文档域单独认证失效，`--dry-run` 返回 HTML 登录页，导致 `JSON Parse error: Unrecognized token '<'`。给文档域补认证又可能撞浏览器自动化超时。

**解法**：先用一条**只读命令**（如 `whoami` / `list`）确认当前工具对目标域认证有效，再开始上传。认证链路不通时换一条能用的工具链，不要在同一个入口反复重试。

### 9. Markdown 导入接口常常不接受裸 `.md`

**现象**：`+import --file-path <x>.md` 报「不支持上传该格式的文件」。相对路径还会先报「导入文件不存在或不可读」——**路径一律用绝对路径**。

**解法**：找平台的「带附件创建」接口，把 Markdown + 图片目录打成 zip 一起传，图片会自动内联。

```bash
cd <产品文档目录> && zip -r /tmp/<slug>.zip <NN>-<slug>-prd.md images/<slug>/
<你的平台 CLI> word +create --title "<标题>" --content-zip /tmp/<slug>.zip
```

zip 内结构保持 Markdown 里的相对引用路径不变（`images/<slug>/xx.png`）。

### 9.1 导出回读要指定输出目录，且用干净目录

**现象**：回读校验时报 `target zip already exists`，即使当前目录下明明没有那个 zip；`cd` 到别处仍报同样的错。

**根因**：`--output-dir` 默认是 `.`，而 **CLI 的工作目录未必随 shell 的 `cd` 变化**（某些 Agent 的 Bash 工具每条命令后会重置 cwd）。它一直在往同一个地方写，第二次就撞名。

**解法**：显式给一个新建的空目录，并加 `--unzip` 直接拿到 md，省去解压：

```bash
rm -rf /tmp/docsverify && mkdir -p /tmp/docsverify
<你的平台 CLI> word +export-md --doc-id <id> --output-dir /tmp/docsverify --unzip
```

返回体里看图片数与跳过数，再 `grep` 一下正文关键段落确认表格与代码块没丢（文档平台常把 Markdown 表格转成 `<table>`，属正常）。

> **这一步同时是最好的灾备**：文档一旦上传成功，本地目录被误删也能靠导出捞回来（实测靠它找回过整批被删的 PRD 与截图）。所以**上传要趁早，别攒到最后一起传**。

### 9.2 扩展命令不随主程序安装

**现象**：换一台机器第一次用某个子命令，报「未知命令」。

**根因**：不少 CLI 把能力拆成扩展/插件，主程序装了不代表子命令可用。

**解法**：先查扩展列表并安装，装完通常无需重启 shell。

## 四、需求任务

### 10. description 字段多半是 HTML，不是纯文本

**现象**：传纯文本进去，页面渲染成一大坨没有层次的段落，URL 也是不可点的裸文本。

**根因**：多数需求平台的 `description` 底层存 HTML（看一个范例任务的 JSON 就能确认，里面全是 `<h2>` `<p>` `<strong>` `<img>`）。

**解法**：直接传 HTML 片段。通常支持 `<h2>` `<h3>` `<p>` `<ul><li>` `<strong>` `<code>` `<a href>` `<img src>`。

```bash
<你的平台 CLI> task edit <taskId> -d "$(cat /tmp/task-desc.html)"
```

> 用 heredoc 在 shell 里内联中文 HTML 容易触发编码报错，**写文件再 `cat`** 最稳。

### 11. 字段选项 ID 不能硬编码

选项 ID 随项目/分类变化，抄别的项目的必然错。用平台的 `fields` 类命令现查，或直接读一个同类范例任务的完整 JSON 反推。

### 12. 创建时的必填项与「单复数陷阱」

两个很典型、且只能靠实际报错踩出来的坑：

- **必填项**：创建接口常有读取时看不见的必填字段（最常见是「执行人」），不传直接报错；
- **读写字段名不一致**：读取时显示 `labels:`（复数），但**写入字段名是单数 `label`**，传复数报「该字段不存在」。

所以：**建任务前先完整读一个同分组的范例任务**，比照它的字段名和取值来写，比看文档快且准。

### 13. 标签 ID 要取自**项目标签池**，不是全局池

**现象**：从全局字段接口拿到标签 ID 传进去，平台接受了，但回读渲染成**裸数字**（显示 `labels:自动需求采集, 3xxxxxx` 而不是名称）。

**根因**：该 ID 不属于当前项目。

**解法**：查**项目级**标签列表拿 ID；项目池里没有就先在项目下建一个。改完一定回读，看到的必须是**中文名**而不是数字。

### 14. CLI 的文本渲染会骗你

**现象**：回读时终端输出把 `<table>` 展平成没有分隔的纯文本，看起来像 HTML 写坏了。

**真相**：这是 CLI 的文本渲染，不是描述写错了。**校验表格渲染要在网页上看**，别照 CLI 输出去改 HTML。
