const fs=require('fs'),path=require('path');
const s=JSON.parse(fs.readFileSync('story.json','utf8'));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=x=>esc(x).replace(/\n/g,'<br>');
function requireThat(ok,msg){if(!ok)throw Error(msg)}
requireThat(typeof s.draft==='boolean','draft must be explicit');
requireThat(/^\d{4}-\d{2}-\d{2}$/.test(s.date),'date must be YYYY-MM-DD');
requireThat(['editorial','light','night'].includes(s.theme),'Unknown theme; extend CSS and validator together');
requireThat(s.cover?.title&&s.cover?.badge&&s.cover?.hook,'Cover needs topic, news and hook');
requireThat(s.pages?.length>0&&s.sources?.length>0,'Need pages and sources');
const maxImages=s.maxImages??18;
requireThat(Number.isInteger(maxImages)&&maxImages>=1,'maxImages must be a positive integer');
requireThat(s.pages.length+1<=maxImages,`Image budget exceeded: ${s.pages.length+1} including cover > ${maxImages}`);
const ids=new Set(s.sources.map(x=>x.id));requireThat(ids.size===s.sources.length,'Duplicate source IDs');
function safeLocal(x){requireThat(typeof x==='string'&&!path.isAbsolute(x)&&!x.split(/[\\/]/).includes('..')&&!/^\w+:/.test(x),'Asset path must stay inside project');return x}
requireThat(s.renderInputs===undefined||Array.isArray(s.renderInputs),'renderInputs must be an array of local dependency files');
for(const input of s.renderInputs||[]){safeLocal(input);requireThat(fs.existsSync(input)&&fs.statSync(input).isFile(),'Missing render input: '+input)}
if(s.cover.hero){safeLocal(s.cover.hero);requireThat(fs.existsSync(s.cover.hero),'Missing hero');requireThat(s.cover.heroAlt&&s.cover.assetNote,'Hero needs alt text and asset provenance note');requireThat(['dark','light'].includes(s.cover.tone),'Hero needs explicit dark/light text treatment')}
const names=['01-cover.html'];
s.pages.forEach((p,i)=>{
 requireThat(['facts','metrics','community','takeaway'].includes(p.kind),'Unknown page kind');
 requireThat(p.title&&p.sourceIds?.length&&p.sourceIds.every(x=>ids.has(x)),'Page needs title and known sourceIds');
 requireThat(p.summary!==undefined,'Each page needs a short summary (may be empty)');
 if(p.kind==='metrics'){
  requireThat(p.chart?.unit&&p.chart?.direction&&p.chart?.max>0&&p.chart?.rows?.length,'Metrics need explicit unit, direction, maximum and rows');
  requireThat(['higher','lower'].includes(p.chart.direction),'Chart direction must be higher or lower');
  for(const r of p.chart.rows)requireThat(Number.isFinite(r.value)&&r.value>=0&&r.value<=p.chart.max&&r.label,'Invalid chart row');
  for(const c of p.scores||[])if(c.total!==undefined)requireThat(Number.isInteger(c.total)&&c.total>0&&c.total<=100&&Number.isInteger(c.passed)&&c.passed>=0&&c.passed<=c.total,'Invalid score denominator');
 }
 if(p.kind==='community')requireThat(p.cases?.length&&p.cases.every(c=>c.task&&c.result&&c.author&&ids.has(c.sourceId)),'Community cases need actual task, result, author and known source');
 if(['facts','takeaway'].includes(p.kind))requireThat(p.items?.length&&p.items.every(x=>x.label&&x.body),'Facts need label and body');
 names.push(`${String(i+2).padStart(2,'0')}-${p.kind}.html`);
});
if(s.cover.hookIsQuestion){requireThat(Number.isInteger(s.cover.answerPage)&&s.cover.answerPage>=2&&s.cover.answerPage<=names.length,'Question hook needs a body-page number');requireThat(s.pages[s.cover.answerPage-2].summary.trim(),'Answer page must contain a direct answer in summary; verify manually')}
const top=()=>`<header class="top"><span>${esc(s.brand)}</span><span>${esc(s.date.replaceAll('-','.'))}</span></header>`;
const footer=(p,n)=>`<footer><span>${esc(p.sourceIds.map(x=>'['+x+']').join(' '))} · ${esc(p.footer||'来源详见随附清单')}</span><span>${String(n).padStart(2,'0')} / ${String(names.length).padStart(2,'0')}</span></footer>`;
const wrap=(body,cls='')=>`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=1080"><title>${esc(s.topic)}</title><link rel="stylesheet" href="style.css"><body class="${esc(s.theme)}"><main class="slide ${cls}">${s.draft?'<aside class="draft">排版示例 · 不可发布</aside>':''}${body}</main></body></html>`;
const cover=wrap(`${s.cover.hero?`<img class="hero" src="${esc(s.cover.hero)}" alt="${esc(s.cover.heroAlt)}">`:''}${top()}<section class="cover-copy"><p class="badge">${txt(s.cover.badge)}</p><h1>${txt(s.cover.title)}</h1><h2>${txt(s.cover.hook)}</h2></section><div class="cover-bottom"><p>${txt(s.cover.bottom||s.topic)}</p><small>${txt(s.cover.assetNote||'文字排版封面')}</small></div>`, 'cover'+(s.cover.tone?' tone-'+s.cover.tone:''));
fs.writeFileSync(names[0],cover);
for(const [i,p]of s.pages.entries()){
 let content='';
 if(['facts','takeaway'].includes(p.kind))content=`<div class="facts">${p.items.map(x=>`<section class="fact"><h3>${txt(x.label)}</h3><p>${txt(x.body)}</p></section>`).join('')}</div>`;
 if(p.kind==='metrics'){
  content=`<div class="scores">${(p.scores||[]).map(c=>`<section><p>${txt(c.label)}</p><strong>${esc(c.value)}</strong>${c.total!==undefined?`<div class="dots" data-passed="${c.passed}" data-total="${c.total}">${Array.from({length:c.total},(_,j)=>`<i class="${j<c.passed?'on':'off'}"></i>`).join('')}</div>`:''}</section>`).join('')}</div><div class="chart"><h3>${txt(p.chart.title)} <small>${p.chart.direction==='higher'?'越高越好':'越低越好'}</small></h3>${p.chart.rows.map(r=>`<div class="barrow"><div>${txt(r.label)}<small>${txt(r.detail||'')}</small></div><div class="track"><div class="bar ${r.highlight?'focus':''}" data-value="${r.value}" data-max="${p.chart.max}" style="width:${r.value/p.chart.max*100}%"></div></div><strong>${r.value}${esc(p.chart.unit)}</strong></div>`).join('')}<div class="axis"><span>0</span><span>${p.chart.max/2}</span><span>${p.chart.max}${esc(p.chart.unit)}</span></div></div><p class="method">${txt(p.method||'')}</p>`;
 }
 if(p.kind==='community')content=`<div class="cases">${p.cases.map(c=>`<section class="case"><h3>${txt(c.task)}</h3><p>${txt(c.result)}</p><small>${esc(c.author)} · [${esc(c.sourceId)}]</small></section>`).join('')}</div>${p.early?`<section class="early"><h3>${txt(p.early.title)}</h3><p>${txt(p.early.body)}</p></section>`:''}`;
 fs.writeFileSync(names[i+1],wrap(`${top()}<div class="content"><p class="section-label">${txt(p.section||p.kind)}</p><h1>${txt(p.title)}</h1><p class="summary">${txt(p.summary)}</p>${content}</div>${footer(p,i+2)}`,p.kind));
}
const sourceText=s.sources.map(x=>`## [${x.id}] ${x.title}\n\n- 类型：${x.type}\n- 来源：${x.url}\n- 发表日期：${x.published||'未注明'}；核对日期：${x.checked||s.date}\n- ${x.note}\n`).join('\n');
fs.writeFileSync('sources.md',`# 来源与范围\n\n资料截至 ${s.date}。${s.draft?'当前为虚构排版示例。':''}\n\n${sourceText}`);
fs.writeFileSync('post-copy.md',`# ${s.caption.title}\n\n${s.caption.paragraphs.join('\n\n')}\n\n${s.caption.tags.map(t=>'#'+t).join(' ')}\n\n## 图片顺序\n\n${names.map((n,i)=>`${i+1}. ${n.replace('.html','.png')}`).join('\n')}\n`);
fs.writeFileSync('pages.json',JSON.stringify(names,null,2));
fs.writeFileSync('index.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(s.topic)} 预览</title><style>body{margin:30px;background:#deded6;font-family:sans-serif}h1{font-size:28px}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}figure{margin:0}img{width:100%}a{color:#202622}figcaption{padding:10px 0}@media(max-width:800px){.gallery{grid-template-columns:repeat(2,1fr)}}</style><h1>${esc(s.topic)}${s.draft?' · 排版示例':''}</h1><p><a href="post-copy.md">发布文案</a> · <a href="sources.md">来源</a></p><div class="gallery">${names.map(n=>`<figure><a href="output/${n.replace('.html','.png')}"><img src="output/${n.replace('.html','.png')}" alt="${esc(n)}"></a><figcaption><a href="${n}">${esc(n)}</a></figcaption></figure>`).join('')}</div></html>`);
console.log(`Built ${names.length} pages${s.draft?' (fictional preview)':''}.`);
