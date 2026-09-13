# IP 形象系统

用固定的 Q 版形象替代真人出镜，既拿人脸红利又不暴露隐私，长期还能沉淀成账号辨识度。

---

## 为什么用 Q 版而非真人

| 维度 | Q 版 IP | 真人出镜 |
|---|---|---|
| 人脸注意力红利 | 有（卡通脸同样触发本能注意） | 有 |
| 隐私风险 | 零 | 高 |
| 辨识度沉淀 | 强，形象永远一致 | 受发型/状态/打光影响 |
| 表情可控性 | 任意夸张，随时生成 | 拍"惊讶"容易假 |
| 边际成本 | 首次建立后近乎为零 | 每期都要拍 |

---

## 形象档案

固定形象参数存放在 `assets/ip/ip-profile.json`。**每次生成新表情都必须读取它**，否则形象会漂移，失去辨识度意义。

> 仓库里自带的是一套**示例形象**（戴熊耳针织帽 + 圆框眼镜的 Q 版角色），仅用于跑通流程。建立你自己的形象后，覆盖 `ip-profile.json` 与 `assets/ip/` 下的立绘即可。

档案记录：性别年龄、发型、配饰（帽子、眼镜）、服装、配色、渲染风格。

---

## 生成新表情的方法

### 方法一：文生图（形象已定型时）

用任意 AI 生图能力（文生图），prompt 骨架：

```
3D Memoji-style cartoon avatar character, chibi proportions, big head.
{读取 ip-profile.json 的 appearance 字段，逐项描述}
Expression: {目标表情的具体描述，包括眼睛、嘴形、手势}
Upper body bust shot, facing slightly toward viewer.
Soft glossy 3D render, Apple Memoji aesthetic, clean smooth shading.
Isolated on a pure solid green screen chroma key background,
no shadow on background, sharp clean edges for cutout.
```

> **绿幕背景是关键**。纯色绿幕才能用脚本精确抠图；白底或透明背景的 AI 生成图边缘往往有杂色。

### 方法二：图生图（要保持形象一致）

把已有的 IP 立绘作为参考图，prompt 说明"keep the exact same character design, only change the expression to ..."。形象一致性比文生图更高。

---

## 推荐的表情库

建立一套复用，每期封面按内容挑：

| 表情 | 用途 | 关键描述 |
|---|---|---|
| 惊叹 | 展示厉害的东西 | wide-eyed astonished, mouth open in small 'wow', hand raised to cheek |
| 思考 | 教程、分析类 | one hand on chin, slightly tilted head, thoughtful squint |
| 无语 | 吐槽、踩坑类 | half-lidded eyes, flat mouth, one eyebrow raised |
| 兴奋 | 发布、安利类 | big open smile, both fists raised, sparkling eyes |
| 指向 | 引导看画面元素 | pointing finger toward viewer's right, confident smile |
| 疑惑 | 提问式标题 | head tilted, one eyebrow up, question mark gesture |

---

## 合成到封面的要点

用 `scripts/compose_ip.py`，它做了四件事：

1. **绿幕抠图** — 判定条件 `G>90 且 G-R>45 且 G-B>45`
2. **去绿溢出** — 边缘残留的绿色反光会很明显，把过绿像素的 G 通道拉回红蓝均值
3. **边缘羽化** — MinFilter 收缩 1px + 高斯模糊 1.2，避免锯齿和白边
4. **柔光底衬** — 在人物后面加一个半透明彩色椭圆光晕，让形象从深色背景里浮出来

**放置检查清单**：
- 占画面高度 40%~55%（太大喧宾夺主，太小没有人脸效果）
- 贴角落，通常左下或右下
- **合成后必须用 Read 工具检查是否挡住文字或徽章**——这是最容易翻车的地方
- 底部可以轻微出血（超出画面 2%~3%），显得自然不悬空

---

## 形象演进

IP 形象一旦确定就**不要轻易改动**主体特征（帽子、眼镜、配色）。要变化就变表情和姿势。

如果确实需要迭代形象（比如换季节服装），保留至少两个识别锚点（如标志性的帽子和眼镜），让老观众仍能认出。
