/* ============================================================
   learn-lab 教学设计校验

   用法：
     myflicker-browser evaluate --tab-id <tabId> \
       --expression-file "<skill-dir>/scripts/pedagogy-check.js" --timeout-ms 60000

   检查的是教学设计属性，不是 CSS 实现：
     - 摘要行有没有给结论
     - 读数有没有参照值
     - 参数有没有动态提示
     - 术语引用是否完整
     - 默认展开是否过多
     - 结论是否随参数改写（实际拖动验证）

   依赖 data-ll-* 语义标记。没有标记的页面只能做通用检查并提示。
   脚本只验证结构性属性，「这个教具讲清楚了没有」必须人看截图。
   ============================================================ */
(async () => {
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const sleep = m => new Promise(r => setTimeout(r, m));
  const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const ll = (name, root) => [...(root || document).querySelectorAll(`[data-ll="${name}"]`)];

  const fail = [], warn = [], pass = [], note = [];
  const info = {};
  const chk = (ok, name, detail) =>
    (ok ? pass : fail).push(detail ? `${name} — ${detail}` : name);

  /* ---------- 0. 基线：有没有语义标记 ----------
     没有标记时，教学设计类检查无法判定。此时一律降级为「待人工确认」，
     绝不报 FAIL —— 页面可能完全合格，只是没标注。 */
  const hasMarkers = !!q('[data-ll]');
  info.semanticMarkers = hasMarkers;
  const unverified = [];
  // soft: 有标记时按 fail/pass 判定；无标记时记入待确认
  const soft = (ok, name, detail, manualHint) => {
    if (hasMarkers) return chk(ok, name, detail);
    unverified.push(manualHint || name);
  };
  if (!hasMarkers) {
    note.push('页面没有 data-ll-* 语义标记 —— 教学设计类检查无法自动判定，' +
      '已降级为 unverified 清单供人工核对。补标记后可自动校验。');
  }

  /* ---------- 1. 基础可用性 ---------- */
  const hOver = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  chk(hOver === 0, '桌面视口无横向溢出', hOver ? `溢出 ${hOver}px` : '');

  const narrow = await new Promise(res => {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:-9999px;width:390px;height:844px;border:0';
    f.src = location.href;
    f.onload = () => setTimeout(() => {
      const d = f.contentDocument;
      res({ hOver: d.documentElement.scrollWidth - d.documentElement.clientWidth });
      f.remove();
    }, 1700);
    f.onerror = () => res({ error: 'iframe 加载失败' });
    document.body.appendChild(f);
  });
  info.narrow390 = narrow;
  chk(narrow.hOver === 0, '390px 窄屏无横向溢出',
    narrow.hOver ? `溢出 ${narrow.hOver}px` : '');

  /* ---------- 2. L1 折叠：摘要必须给结论 ---------- */
  const folds = ll('fold');
  const details = qa('details').filter(d => !folds.includes(d));
  info.folds = folds.length;

  if (!folds.length && !details.length) {
    fail.push('没有折叠结构 — 概念解释很可能是平铺的，这是第一版最常见的错误');
  } else if (!folds.length) {
    unverified.push(`${details.length} 个 <details> 的摘要质量：` +
      `只读摘要行能否答出标题的问题`);
  }

  if (folds.length) {
    const openNow = folds.filter(f => f.open);
    info.foldsOpenByDefault = openNow.length;
    if (openNow.length > 2) {
      warn.push(`默认展开 ${openNow.length}/${folds.length} 个折叠，建议 ≤ 2，` +
        `否则等于没折叠`);
    }

    // 摘要必须存在且足够长（能承载一个结论）
    const weakTldr = [];
    const noQuestion = [];
    const placeholderish = /^(点开|展开|查看|详见|见下|点击|更多|说明|详细|这里)/;
    folds.forEach((f, i) => {
      const qEl = f.querySelector('[data-ll="fold-q"]');
      const tEl = f.querySelector('[data-ll="fold-tldr"]');
      const qs = txt(qEl), ts = txt(tEl);
      const label = qs ? `"${qs.slice(0, 20)}"` : `#${i + 1}`;
      if (!tEl) weakTldr.push(`${label} 无摘要`);
      else if (placeholderish.test(ts)) weakTldr.push(`${label} 摘要是占位语「${ts.slice(0, 14)}」`);
      else if (ts.length < 12) weakTldr.push(`${label} 摘要过短(${ts.length}字)`);
      if (qs && !/[？?]/.test(qs)) noQuestion.push(label);
    });
    const uniq = a => [...new Set(a)];
    const weakU = uniq(weakTldr), noQU = uniq(noQuestion);
    chk(weakU.length === 0, '每个折叠的摘要都给了结论',
      weakU.length
        ? `${weakTldr.length} 处：${weakU.slice(0, 3).join(' / ')}` +
          `（判定标准：只读摘要能否答出标题的问题）`
        : '');
    if (noQU.length) {
      warn.push(`${noQuestion.length}/${folds.length} 个折叠标题不是问句，` +
        `读者难以判断是否该展开：${noQU.slice(0, 3).join(', ')}`);
    }

    // 展开后正文要分段（多论点不能堆在一个段落）
    // 阈值按中文校准：一段 >110 字已是明显的墙，或正文总量 >260 字而毫无分段手段
    const noSection = [];
    for (const f of folds) {
      const was = f.open;
      f.open = true;
      await sleep(60);
      const body = f.querySelector('[data-ll="fold-body"]') || f;
      const segments = body.querySelectorAll(
        'h3,h4,h5,[data-ll="fold-h"],ul,ol,table,dl,blockquote').length;
      const paras = [...body.querySelectorAll('p')];
      const lens = paras.map(p => txt(p).length);
      const longParas = lens.filter(n => n > 110).length;
      const bulk = lens.reduce((a, b) => a + b, 0);
      const label = `"${txt(f.querySelector('[data-ll="fold-q"]')).slice(0, 20)}"`;
      if (segments === 0 && (longParas >= 2 || bulk > 260)) {
        noSection.push(`${label}（${paras.length} 段 / 共 ${bulk} 字 / 无小标题或列表）`);
      }
      f.open = was;
      await sleep(30);
    }
    chk(noSection.length === 0, '展开后的正文有分段',
      noSection.length ? `${noSection.join(', ')} 为大段堆砌，应加小标题或列表` : '');

    // 折叠能正常展开
    const f0 = folds.find(f => !f.open) || folds[0];
    const was0 = f0.open;
    f0.open = true;
    await sleep(240);
    const bodyEl = f0.querySelector('[data-ll="fold-body"]');
    const bh = bodyEl ? bodyEl.getBoundingClientRect().height : 0;
    chk(bh > 25, '折叠展开后正文可见', bh > 25 ? '' : `body 高度仅 ${bh.toFixed(0)}px`);
    f0.open = was0;
  }

  /* ---------- 3. L0 教具：读数参照 + 动态提示 + 结论 ---------- */
  const reads = ll('read');
  const sliders = qa('input[type=range]');
  const ctls = ll('ctl');
  const verdicts = ll('verdict');
  info.reads = reads.length;
  info.sliders = sliders.length;
  info.verdicts = verdicts.length;

  if (reads.length) {
    const noRef = reads.filter(r => {
      const ref = r.querySelector('[data-ll="read-ref"]');
      return !ref || txt(ref).length < 2;
    });
    chk(noRef.length === 0, '每个读数都有参照值',
      noRef.length ? `${noRef.length}/${reads.length} 缺参照 —— ` +
        `「1.0」本身没有意义，要给临界值或算式` : '');
  } else if (sliders.length) {
    unverified.push('每个读数是否有参照值（临界值 / 算式 / 对比基准）');
  }

  if (sliders.length) {
    // 动态提示
    const hintMissing = sliders.filter(s => {
      const scope = s.closest('[data-ll="ctl"]') || s.parentElement;
      return !scope.querySelector('[data-ll="ctl-hint"]');
    });
    soft(hintMissing.length === 0, '每个参数都有动态提示',
      hintMissing.length ? `${hintMissing.length}/${sliders.length} 缺 ctl-hint —— ` +
        `静态括号说明的信息量远低于随值改写的提示` : '',
      `${sliders.length} 个参数是否都有「随值改写」的动态提示`);

    // 说明入口
    const explainMissing = sliders.filter(s => {
      const scope = s.closest('[data-ll="ctl"]') || s.parentElement;
      return !scope.querySelector('[data-ll="explain"],[data-ll="term"]');
    });
    if (hasMarkers && explainMissing.length) {
      warn.push(`${explainMissing.length}/${sliders.length} 个参数没有说明入口(data-ll="explain")`);
    } else if (!hasMarkers) {
      unverified.push('每个参数旁是否有可悬浮的说明入口');
    }

    // 结论存在性
    soft(verdicts.length > 0, '教具有结论（回答「所以呢」）',
      verdicts.length ? '' : '有可调参数但没有 data-ll="verdict"，' +
        '读者看不出数值变化的含义',
      '每个教具是否有「所以呢」的结论，且随参数改写');

    /* ---------- 4. 实际拖动：验证联动 ----------
       无标记时退化为「整页文本有没有变」，只能判断页面是否响应，
       不能判断具体是读数变了还是结论变了。 */
    const s0 = sliders[0];
    const scope0 = s0.closest('[data-ll="ctl"]') || s0.parentElement;
    const hint0 = scope0.querySelector('[data-ll="ctl-hint"]');
    const panel0 = s0.closest('[data-ll="panel"],section') || document.body;
    const snap = () => ({
      hint: hint0 ? txt(hint0) : null,
      reads: reads.map(r => txt(r.querySelector('[data-ll="read-v"]') || r)),
      verdicts: verdicts.map(v => txt(v)),
      verdictCls: verdicts.map(v => v.className),
      panelText: txt(panel0).slice(0, 4000)
    });

    const min = +s0.min || 0, max = +s0.max || 100;
    const orig = s0.value;
    s0.value = String(min);
    s0.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(240);
    const atMin = snap();
    s0.value = String(max);
    s0.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(280);
    const atMax = snap();

    const panelChanged = atMin.panelText !== atMax.panelText;
    chk(panelChanged, '拖动参数后页面有响应',
      panelChanged ? '' : '两个极值下教具区域文本完全相同，滑块可能没有生效');

    if (reads.length) {
      const readsChanged = atMin.reads.join('|') !== atMax.reads.join('|');
      chk(readsChanged, '拖动参数后读数改变');
    }
    if (hint0) {
      const hintChanged = atMin.hint !== atMax.hint;
      chk(hintChanged, '拖动参数后动态提示改写',
        hintChanged ? '' : '两个极值下提示文案相同，说明它其实是静态的');
    }
    if (verdicts.length) {
      const verdictChanged = atMin.verdicts.join('|') !== atMax.verdicts.join('|') ||
        atMin.verdictCls.join('|') !== atMax.verdictCls.join('|');
      chk(verdictChanged, '拖动参数后结论改写',
        verdictChanged ? '' : '两个极值下结论完全相同 —— ' +
          '结论必须随状态改写（含状态名和配色），不能是静态文字');
    }
    if (!hasMarkers) {
      unverified.push('拖动参数后，读数 / 动态提示 / 结论三者是否都随之改写');
    }
    info.dragTest = {
      min, max, panelChanged,
      hintChanged: hint0 ? atMin.hint !== atMax.hint : null,
      readsChanged: reads.length ? atMin.reads.join('|') !== atMax.reads.join('|') : null,
      verdictChanged: verdicts.length
        ? (atMin.verdicts.join('|') !== atMax.verdicts.join('|') ||
           atMin.verdictCls.join('|') !== atMax.verdictCls.join('|'))
        : null
    };

    // 还原
    s0.value = orig;
    s0.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(120);
  } else {
    warn.push('页面没有 input[type=range]。如果主题本身无连续参数可忽略，' +
      '但要确认 L0 层确实有可操作的教具');
  }

  /* ---------- 5. L3 术语引用完整性 ---------- */
  const termEls = qa('[data-term]');
  const termKeys = [...new Set(termEls.map(e => e.dataset.term))];
  const dict = window.LL_TERMS || null;
  info.termRefs = termKeys.length;
  info.termDict = dict ? Object.keys(dict).length : null;

  if (termKeys.length && dict) {
    const undef = termKeys.filter(k => !dict[k]);
    chk(undef.length === 0, '术语引用全部有定义',
      undef.length ? `未定义：${undef.join(', ')}` : '');
    const thin = termKeys.filter(k => dict[k] && (!dict[k].body || dict[k].body.length < 15));
    if (thin.length) warn.push(`${thin.length} 条术语说明过短：${thin.join(', ')}`);
    const unused = Object.keys(dict).filter(k => !termKeys.includes(k));
    if (unused.length) note.push(`字典里有 ${unused.length} 条未被引用：${unused.slice(0, 5).join(', ')}`);
  } else if (termKeys.length && !dict) {
    unverified.push(`${termKeys.length} 个 data-term 引用是否都有对应说明`);
  } else if (!termKeys.length) {
    const guessTerms = qa('[title]').filter(e => (e.getAttribute('title') || '').length > 12);
    if (guessTerms.length) {
      unverified.push(`没有 data-term，但有 ${guessTerms.length} 处 title 提示：` +
        `确认读者卡在生词上时有处可查`);
    } else {
      warn.push('没有可查术语 —— 读者卡在生词上时无处可查');
    }
  }

  // 悬浮定位：逐个实测是否出界
  if (termEls.length) {
    const bad = [];
    const probe = termEls.slice(0, 12);
    for (const el of probe) {
      const fold = el.closest('details');
      const was = fold ? fold.open : null;
      if (fold) fold.open = true;
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      await sleep(140);
      el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await sleep(190);
      // 找当前可见的浮层
      const pops = qa('[data-ll="tip"],[role="tooltip"]')
        .filter(p => p.getBoundingClientRect().height > 4 &&
          getComputedStyle(p).opacity !== '0');
      if (pops.length) {
        const r = pops[0].getBoundingClientRect();
        const out = [];
        if (r.left < 0) out.push('左出界');
        if (r.right > innerWidth) out.push('右出界');
        if (r.top < 0) out.push('上出界(缺翻转逻辑)');
        if (r.bottom > innerHeight) out.push('下出界');
        if (out.length) bad.push(`${el.dataset.term}: ${out.join('/')}`);
      }
      el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      if (fold && was === false) fold.open = false;
      await sleep(90);
    }
    if (bad.length) {
      fail.push(`术语浮层定位出界 — ${bad.join(' | ')}`);
    } else {
      pass.push(`${probe.length} 个术语浮层定位正常`);
    }
  }

  /* ---------- 6. L3 答疑兜底 ---------- */
  const askEntry = q('[data-ll="ask-entry"]') ||
    qa('button').find(b => /疑问|提问|问答|帮助|FAQ/i.test(txt(b)));
  const askItems = ll('ask-item');
  info.askItems = askItems.length;
  if (!askEntry) {
    warn.push('没有答疑入口 —— 建议提供常驻入口 + 可导出带当前参数的提问模板');
  } else {
    pass.push('有答疑入口');
    const exporter = q('[data-ll="ask-export"]') ||
      qa('button').find(b => /复制|导出|模板/.test(txt(b)));
    if (!exporter) {
      warn.push('答疑面板没有提问模板导出 —— ' +
        '单文件无法联网，导出带参数的上下文是最接近「直接对话」的形式');
    }
  }

  /* ---------- 7. 数据可信度 ---------- */
  const srcs = ll('src');
  const kinds = [...new Set(srcs.map(e => e.dataset.srcKind).filter(Boolean))];
  info.srcTags = srcs.length;
  info.srcKinds = kinds;
  if (srcs.length) {
    pass.push(`有 ${srcs.length} 处数据来源标注`);
    if (!kinds.includes('calc')) {
      note.push('没有标为 calc 的推导值。如果页面有由基准算出的派生指标，应标明并写出算式');
    }
  } else if (hasMarkers) {
    fail.push('没有数据来源标注(data-ll="src") — ' +
      '读者无法判断哪些是官方规格、哪些是推导值、哪些是量级近似');
  } else {
    // 无标记时找关键词线索，避免误判
    const body = txt(document.body);
    const looksLabeled = /官方规格|量级近似|推导值|实测|近似|来源/.test(body);
    if (looksLabeled) {
      unverified.push('数据来源是否逐项标注了三级可信度（官方规格 / 推导值 / 量级近似）');
    } else {
      fail.push('全文找不到数据来源相关表述 — ' +
        '每个数字都要能追溯，否则读者只能选择信或不信');
    }
  }

  /* ---------- 8. 模块与导航：追加内容后最容易塌的地方 ---------- */
  const mods = ll('module').length ? ll('module') : qa('section[id]');
  const navs = qa('nav a[href^="#"]');
  info.modules = mods.length;
  info.navLinks = navs.length;
  if (navs.length) {
    const broken = navs.map(a => a.getAttribute('href')).filter(h => !q(h));
    chk(broken.length === 0, '导航锚点全部可达',
      broken.length ? `失效 ${broken.join(', ')} —— ` +
        `常见原因：插入内容时 old_string 跨越了 </section> 边界，吃掉了模块开标签` : '');

    // 数量不等是硬错误，不是建议：说明有模块被吃掉或导航漏改
    if (mods.length) {
      chk(navs.length === mods.length, '导航项数 = 模块数',
        navs.length === mods.length ? ''
          : `导航 ${navs.length} 项 vs 模块 ${mods.length} 个。` +
            (mods.length < navs.length
              ? '模块比导航少 —— 很可能有 <section> 开标签被编辑吃掉了'
              : '导航比模块少 —— 新增模块后忘了加导航项'));
    }

    // 编号一致性：插入模块后最容易漏改后续编号
    const modNums = mods.map(m => {
      const n = m.querySelector('[data-ll="module-n"],.mod-n');
      return n ? txt(n) : null;
    }).filter(Boolean);
    const navNums = navs.map(a => {
      const n = a.querySelector('[data-ll="nav-n"],.nav-n');
      return n ? txt(n) : null;
    }).filter(Boolean);
    if (modNums.length && navNums.length) {
      const same = modNums.length === navNums.length &&
        modNums.every((n, i) => n === navNums[i]);
      chk(same, '模块编号与导航一致',
        same ? '' : `正文 [${modNums.join(',')}] vs 导航 [${navNums.join(',')}] —— ` +
          `插入模块后要改后续所有编号`);
      info.moduleNumbers = modNums;
    }

    const noSub = navs.filter(a => !a.querySelector('small,[data-ll="nav-sub"]'));
    if (noSub.length === navs.length && navs.length > 2) {
      note.push('导航项没有副标题。加一行「这个模块解决什么」能让读者直接跳到自己的疑问');
    }
  }

  /* ---------- 8b. 提问模板是否跟上了新参数 ---------- */
  // 模板的作用是让读者带完整上下文去问 AI，少一个参数上下文就是残缺的。
  // 脚本只能做启发式提示，真正要靠人工核对。
  const exportBtn = q('[data-ll="ask-export"]') ||
    qa('button').find(b => /复制|导出|模板/.test(txt(b)));
  if (exportBtn && sliders.length) {
    const srcText = [...qa('script')].map(s => s.textContent).join('\n');
    // 粗略找模板字符串里出现的变量数
    const tplBlock = srcText.match(/(?:tpl|template|prompt)\s*=\s*`[\s\S]{40,2000}?`/);
    if (tplBlock) {
      const varsInTpl = new Set((tplBlock[0].match(/\$\{[^}]+\}/g) || [])
        .map(v => v.replace(/[${}]/g, '').split(/[.\[(]/)[0].trim()));
      info.askTemplateVars = varsInTpl.size;
      if (varsInTpl.size < sliders.length) {
        warn.push(`提问模板里只引用了 ${varsInTpl.size} 个变量，但页面有 ` +
          `${sliders.length} 个可调参数 —— 新增参数后记得同步模板，` +
          `否则导出的上下文不完整`);
      }
    } else {
      note.push('找不到提问模板的字符串，无法校验参数覆盖，请人工确认' +
        '新增参数已同步进导出文本');
    }
  }

  /* ---------- 9. 首屏使用说明 ---------- */
  const heroText = txt(q('header')) || txt(q('[data-ll="hero"]')) || '';
  const hasGuide = /怎么读|如何阅读|使用说明|折叠|悬浮|点开|展开/.test(heroText);
  if (folds.length && !hasGuide) {
    warn.push('首屏没有说明「怎么读这页」—— ' +
      '分层架构对第一次打开的人不是自明的');
  }

  /* ---------- 汇总 ---------- */
  return JSON.stringify({
    verdict: fail.length === 0
      ? (warn.length ? `PASS（${warn.length} 项建议）` : 'PASS')
      : `FAIL：${fail.length} 项`,
    reminder: '本脚本只验证结构性属性。「这个教具到底讲清楚了没有」必须截图人看 —— ' +
      '至少看首屏、每个教具默认态、折叠收起态、答疑面板。',
    fail,
    warn,
    unverified: unverified.length
      ? { hint: '以下项目本次无法自动判定，请人工核对（补 data-ll 标记后可自动化）', items: unverified }
      : undefined,
    note,
    pass,
    info
  }, null, 1);
})()
