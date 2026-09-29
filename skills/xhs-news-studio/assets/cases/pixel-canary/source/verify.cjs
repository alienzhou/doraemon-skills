const puppeteer=require('puppeteer-core');
const fs=require('fs');const path=require('path');const {pathToFileURL}=require('url');
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage();await page.setViewport({width:1080,height:1440});
 const report=[];
 try{
 for(const file of fs.readdirSync('.').filter(x=>/^\d.*\.html$/.test(x)).sort()){
  await page.goto(pathToFileURL(path.resolve(file)).href,{waitUntil:'networkidle0'});
  await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   const slide=document.querySelector('.slide'),sr=slide.getBoundingClientRect(),texts=[],errors=[];
   const walker=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT);
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
   while(walker.nextNode()){
    const n=walker.currentNode;if(!n.textContent.trim())continue;
    const r=document.createRange();r.selectNodeContents(n);
    const rects=Array.from(r.getClientRects()).filter(r=>r.width>0&&r.height>0);
    const style=getComputedStyle(n.parentElement);
    ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics=ctx.measureText(n.textContent.trim());
    // DOM font boxes include empty ascender/descender space. Use glyph ink bounds for collision checks.
    rects.forEach(rect=>{const baseline=rect.top+metrics.fontBoundingBoxAscent;
     texts.push({text:n.textContent.trim(),rect:{left:rect.left,right:rect.right,top:baseline-metrics.actualBoundingBoxAscent,bottom:baseline+metrics.actualBoundingBoxDescent},node:n});
    });
   }
   for(const t of texts)if(t.rect.left<sr.left-1||t.rect.right>sr.right+1||t.rect.top<sr.top-1||t.rect.bottom>sr.bottom+1)errors.push('文字超出画布：'+t.text);
   for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
    const a=texts[i],b=texts[j];if(a.node===b.node)continue;
    const w=Math.min(a.rect.right,b.rect.right)-Math.max(a.rect.left,b.rect.left),h=Math.min(a.rect.bottom,b.rect.bottom)-Math.max(a.rect.top,b.rect.top);
    if(w>2&&h>2)errors.push('文字相互遮挡：'+a.text+' / '+b.text);
   }
   const cutout=document.querySelector('.cutout');
   if(cutout){const r=cutout.getBoundingClientRect();for(const t of texts){const w=Math.min(t.rect.right,r.right)-Math.max(t.rect.left,r.left),h=Math.min(t.rect.bottom,r.bottom)-Math.max(t.rect.top,r.top);if(w>2&&h>2)errors.push('插画覆盖文字：'+t.text);}}
   const brokenImages=Array.from(document.images).filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src);
   if(brokenImages.length)errors.push('图片未加载');
   const str=slide.innerText;
   if(/不是.{0,40}而是|�|Lorem ipsum|undefined|NaN/.test(str))errors.push('禁用句式或占位文字');
   if(document.documentElement.lang!=='zh-CN')errors.push('语言设置错误');
   const dots=Array.from(document.querySelectorAll('.dots')).map(el=>({total:el.children.length,passed:el.querySelectorAll('i:not(.off)').length}));
   const bars=Array.from(document.querySelectorAll('.bar')).map(el=>parseFloat(el.style.width));
   return {errors,textFragments:texts.length,brokenImages,dots,bars,text:str};
  });
  if(file==='03-benchmark.html'){
   if(JSON.stringify(result.dots)!==JSON.stringify([{total:31,passed:28},{total:31,passed:30}]))result.errors.push('通过数量与来源不一致');
   [97,90,90,84,81].forEach((rate,i)=>{if(Math.abs(result.bars[i]-rate)>.001)result.errors.push('条形图刻度错误');});
  }
  report.push({file,...result});
 }
 fs.writeFileSync('output/detail-check.json',JSON.stringify(report,null,2));
 const errors=report.flatMap(x=>x.errors.map(e=>x.file+': '+e));
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: all 6 cards; text boundaries, text overlap, illustration placement, assets, Chinese locale, data and chart scale.');
 }finally{await browser.close();}
})();
