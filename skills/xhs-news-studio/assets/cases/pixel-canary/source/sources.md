# 来源与核对说明

核对日期：2026-09-29。用户提供的《执行摘要.pdf》作为选题起点；下列网页用于重新核对发布信息、数字和个人反馈。这里的个人测试均未由本项目复现。

## [1] 上线与使用条件

- [Vercel 官方发布公告](https://vercel.com/changelog/pixel-canary-is-now-available-in-stealth-for-free-on-ai-gateway)
- 公告日期：2026-09-25。
- 支持图 02：接入平台、模型 ID、限时免费、网页和移动应用开发方向，以及提示词与回复可能用于训练。
- Vercel 是接入平台。不能据此写成 Vercel 自研模型。
- 限时免费不等于永久、不限量使用；无零数据保留不等于“完全没有隐私保护”。

## [2] Next.js Agent Evals

- [官方榜单](https://nextjs.org/evals)
- 数据快照：Last run date 为 September 25, 2026。

| 模型 | Agent | 基础通过率（榜单取整） | 加文档 |
|---|---|---:|---:|
| Claude Opus 5.5 (high) | Claude Code | 97% | 97% |
| Pixel Canary | OpenCode | 90% | 97% |
| GPT 6 Astra (high) | Codex | 90% | 97% |
| Kimi K3 | OpenCode | 84% | 97% |
| GLM 5.2 | OpenCode | 81% | 97% |

图 03 展示以上部分模型的基础通过率，横轴从 0 到 100%，越高越好。完整榜单还包括 GPT 6 Sol、Claude Fable 5.1、Grok 4.7、Gemini 3.8 Flash 等，本图不作完整排名。

Pixel Canary 的 28/31（90.3%）与 30/31（96.8%）由 [1] 公告提供。每条小格共 31 个。两组属于基础配置与加入 Next.js 文档的配置。

这是模型与 Agent 组合的结果。pass@4 表示最多四次尝试中一次成功即通过；不能写成单次成功率。各模型使用的 Agent 不同，不能把结果泛化为全部编码任务的能力排名。

## [3] X 用户 @notjazii 的初步体验

- [原帖链接](https://x.com/notjazii/status/2103828507855892613)
- [本次可读取的帖文镜像](https://twiscan.com/en/x/notjazii/2103828507855892613)
- 镜像标注日期：2026-09-26。
- 本次未能直接打开 X 原帖；依据镜像保留的作者、时间和正文做中文摘要，图上标注“帖文镜像”。
- 图 04 摘要：长时间思考，Cline 中多次中断，尚未完成测试。
- 图 05：作者依据推理风格猜测 Qwen 或 GLM，较早帖文也提到 Kimi；只属于个人猜测。
- 不用镜像页面证明测试能力强弱；不把镜像截图伪装成 X 原生页面。

## [4] Reddit / r/opencode 的用户反馈

- [原讨论页](https://www.reddit.com/r/opencode/comments/1wqjlp0/pixel_canary_another_one_free_stealth_model_just/)
- 用户 u/EtadanikM 称读取代码库耗时约 30 分钟，难以完整判断模型能力。
- 页内也有基于 Pixel 命名而提出的 Google / Gemini 猜测。
- 图 04 为转述，未复制用户完整评论。该例不代表平均体验或统计比例。

## [5] AI 時短ラボ的独立测试

- [作者测试记录](https://www.ai-jitan-hub.com/news/pixel-canary-stealth-model)
- 测量时间：2026-09-26，日本时间晚间。
- 行为问答的响应时间中位数 88 秒；本轮不再放入图 04，腾出位置呈现具体作品与效果。
- 图 05：95 条字符串的输入 token 计数，与“Qwen 3.5+ 词表 + 旧 Qwen 3 切分规则”的组合匹配 95/95；直接使用原版 Qwen 3.5+ tokenizer 为 89/95。
- 这是输入 token 计数匹配；不等于确认内部 tokenizer 完全一致，更不能确认模型权重、具体版本或开发公司。
- 没有使用“Qwen 身份已坐实”“大概率来自阿里”或未经验证的概率排名。

## [6] Fahd Mirza 的完整测试视频

- [YouTube 原视频](https://www.youtube.com/watch?v=Y0zrQA86uYg)
- 标题：Pixel Canary: The Free Stealth Model Beating Expensive Models。
- 2026-09-27 发布。已读取 YouTube 原视频的英文自动字幕；下列为测试者的实际演示与口述摘要。
- 0:50–5:09：通过 Hermes Agent 构建 Blender + Three.js 的 3D 西装定制页面（bespoke suit，不是太空服）。2:56 自动旋转；3:03 材质不佳；3:25–3:35 换色正常；3:38–3:56 纽扣效果欠佳；3:58–4:06 缩放和鼠标旋转可用。测试者对造型整体不满意。
- 5:12–7:04：Oracle SQL 报表调试。6:07–6:29 作者称模型找到了 self-join 缺失 region ID 的错误，并给出修复前后数据；6:51–7:04 按要求局部修复，没有重写整条查询。
- 图 04 两个案例均注明同一测试者；未当作两位独立用户或标准化得分。字幕与个人评价不等于本项目复现。
- [kiheute 的视频摘要](https://kiheute.ch/stealth-modell-pixel-canary-im-praxistest-gegen-teure-konkurrenz/)只用于发现原视频。该自动摘要把西装译为太空服，最终卡片已依据原字幕修正，未采用其价格与模型推测。

## [7] Reddit 的 Three.js 鹈鹕作品测试

- [原帖与作者回复](https://www.reddit.com/r/PiCodingAgent/comments/1wrot0c/same_prompt_same_pipeline_adaptorch_pi_based_omk/)
- 作者：u/Fabulous-Lobster9456。
- 作者称两组结果都通过 14/14 项代码验证检查，无语法与运行错误；但认为 Pixel Canary 的造型松散、3D 空间关系差。
- 这是单个作者的 Three.js 测试及主观评价，14/14 不代表标准化视觉效果满分。卡片没有把此数值做成成绩图。
- 帖子标题与评论涉及 AdaptOrch、OMK/Pi；作者在回复中补充，不同片段使用的流程不同，因此卡片不宣称这是严格控制的同条件横评。

## 补查后未纳入卡片的材料

- [Cline 的 Reddit 公告](https://www.reddit.com/r/CLine/comments/1wqkucr/pixel_canary_new_stealth_model_is_now_free_in/)：提供接入信息，未当作独立评测。
- [36氪转发的 InfoQ 文章](https://www.36kr.com/p/4002763087040387)：出现孔雀、鹈鹕和马里奥测试转述。未独立核对全部原帖与作品，未把这些二手转述放入卡片；本次采用可读取的原视频 [6] 和原帖 [7]。

## 制图说明

- 图 02 的网页、手机是用途示意图，不是模型产出或实测截图。
- 封面为 imagegen 生成的概念插画，非模型官方 Logo。
- 图 04 是有来源的中文摘要卡，不是原帖截图，也没有伪造点赞量、转发量或头像。
- 出处编号与图 04、05 页脚对应；更多信息用于查证，不要求全部写进小红书正文。
- “AI 效率实验室”为网站 AI 時短ラボ 的中文译名。
- 介绍页金丝雀为透明背景 AI 概念插画，不含文字。

## 封面问句的对应答案

封面 A 使用“超过 GPT-6？”作为提问。图 03 与发布文案明确回答：这组 Next.js 评测里，Pixel Canary 与 GPT-6 Astra 的基础通过率均为榜单取整后的 90%，加文档后均为 97%。未声称超过 GPT-6 全系列或综合能力更强；不同 Agent 的配置说明保留。
