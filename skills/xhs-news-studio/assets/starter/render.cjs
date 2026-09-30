const fs=require('fs'),path=require('path'),crypto=require('crypto'),{pathToFileURL}=require('url');
const puppeteer=require('puppeteer-core');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
(async()=>{
 const names=JSON.parse(fs.readFileSync('pages.json','utf8'));
 const story=JSON.parse(fs.readFileSync('story.json','utf8'));
 const extraInputs=story.renderInputs||[];
 if(!Array.isArray(extraInputs)||extraInputs.some(p=>typeof p!=='string'||path.isAbsolute(p)||p.split(/[\\/]/).includes('..')||/^\w+:/.test(p)))throw Error('renderInputs must stay inside project');
 const candidates=[process.env.CHROME_PATH,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser',process.env.PROGRAMFILES&&path.join(process.env.PROGRAMFILES,'Google/Chrome/Application/chrome.exe')].filter(Boolean);
 const executablePath=candidates.find(p=>fs.existsSync(p));
 if(!executablePath)throw Error('Chrome/Chromium not found. Set CHROME_PATH to its executable.');
 fs.mkdirSync('output',{recursive:true});
 const browser=await puppeteer.launch({executablePath,headless:true});
 const results=[],assets=new Set();
 try{
  const page=await browser.newPage();await page.setViewport({width:1080,height:1440,deviceScaleFactor:1});
  for(const name of names){
   await page.goto(pathToFileURL(path.resolve(name)).href,{waitUntil:'networkidle0'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(i=>i.decode().catch(()=>{})))});
   const r=await page.evaluate(()=>{
    const errors=[],slide=document.querySelector('.slide'),box=slide.getBoundingClientRect();
    if(box.width!==1080||box.height!==1440)errors.push('Export dimensions differ from 1080x1440');
    const imgs=Array.from(document.images);if(imgs.some(i=>!i.complete||!i.naturalWidth))errors.push('Broken image');
    for(const el of slide.querySelectorAll('h1,h2,h3,p,section,footer,.barrow')){
     const b=el.getBoundingClientRect();if(b.left<box.left-1||b.right>box.right+1||b.bottom>box.bottom+1||el.scrollWidth>el.clientWidth+2)errors.push('Overflow: '+el.textContent.slice(0,50));
    }
    const foot=slide.querySelector('footer'),body=slide.querySelector('.content');
    const footerGap=foot&&body?foot.getBoundingClientRect().top-body.getBoundingClientRect().bottom:null;
    if(footerGap!==null&&footerGap<18)errors.push('Footer gap '+footerGap);
    const ctx=document.createElement('canvas').getContext('2d'),walker=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT),texts=[];
    while(walker.nextNode()){
     const node=walker.currentNode;if(!node.textContent.trim())continue;
     const range=document.createRange();range.selectNodeContents(node);
     const st=getComputedStyle(node.parentElement);ctx.font=`${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
     const m=ctx.measureText(node.textContent.trim());
     for(const b of range.getClientRects())if(b.width>0){const base=b.top+m.fontBoundingBoxAscent;texts.push({node,text:node.textContent.trim(),left:b.left,right:b.right,top:base-m.actualBoundingBoxAscent,bottom:base+m.actualBoundingBoxDescent})}
    }
    for(const t of texts)if(t.left<box.left-1||t.right>box.right+1||t.top<box.top-1||t.bottom>box.bottom+1)errors.push('Text outside canvas: '+t.text);
    for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
     const a=texts[i],b=texts[j];if(a.node===b.node)continue;
     if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)errors.push('Text overlap: '+a.text+' / '+b.text);
    }
    for(const bar of slide.querySelectorAll('.bar')){
     const expected=+bar.dataset.value/+bar.dataset.max;
     const actual=bar.getBoundingClientRect().width/bar.parentElement.getBoundingClientRect().width;
     if(Math.abs(expected-actual)>.002)errors.push('Chart width inconsistent with value');
    }
    for(const dots of slide.querySelectorAll('.dots'))if(dots.children.length!==+dots.dataset.total||dots.querySelectorAll('.on').length!==+dots.dataset.passed)errors.push('Count grid inconsistent');
    if(/不是[^\n]{0,45}而是|Lorem ipsum|undefined|NaN|�/.test(slide.innerText))errors.push('Unwanted copy or placeholder');
    return {errors,footerGap,text:slide.innerText,assets:imgs.map(i=>i.getAttribute('src'))};
   });
   r.assets.forEach(a=>assets.add(a));
   await page.screenshot({path:'output/'+name.replace('.html','.png')});results.push({page:name,...r});
  }
  await page.setViewport({width:1500,height:1600});await page.goto(pathToFileURL(path.resolve('index.html')).href,{waitUntil:'networkidle0'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(i=>i.decode()))});
  await page.screenshot({path:'output/overview.png',fullPage:true});
  await page.setViewport({width:1500,height:480});
  await page.setContent(`<body style="margin:0;padding:24px;background:#ddd;font-family:sans-serif"><h2>240px 缩略图检查</h2><div style="display:flex;gap:20px;flex-wrap:wrap">${names.map(n=>`<img width="240" height="320" src="${pathToFileURL(path.resolve('output/'+n.replace('.html','.png')))}">`).join('')}</div></body>`);
  await page.evaluate(async()=>{await Promise.all(Array.from(document.images).map(i=>i.decode()))});await page.screenshot({path:'output/thumbnails.png',fullPage:true});
 }finally{await browser.close()}
 const inputFiles=[...new Set(['story.json','pages.json','build.cjs','render.cjs','package.py','style.css','index.html','post-copy.md','sources.md',...names,...assets,...extraInputs])];
 const outputs=names.map(n=>'output/'+n.replace('.html','.png')).concat(['output/overview.png','output/thumbnails.png']);
 const qa={ok:results.every(r=>!r.errors.length),results,inputHashes:Object.fromEntries(inputFiles.map(p=>[p,sha(p)])),outputHashes:Object.fromEntries(outputs.map(p=>[p,sha(p)]))};
 fs.writeFileSync('output/qa.json',JSON.stringify(qa,null,2));
 if(!qa.ok){console.error(results.filter(r=>r.errors.length));process.exitCode=1}else console.log('Rendered and checked '+names.length+' pages. Visual and factual review still required.');
})().catch(e=>{console.error(e);process.exitCode=1});
