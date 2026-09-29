const puppeteer=require('puppeteer-core');
const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
(async()=>{
 fs.mkdirSync('output',{recursive:true});
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const page=await browser.newPage();
 await page.setViewport({width:1080,height:1440,deviceScaleFactor:1});
 const results=[];
 for(const file of fs.readdirSync('.').filter(x=>/^\d.*\.html$/.test(x)).sort()){
  await page.goto(pathToFileURL(path.resolve(file)).href,{waitUntil:'networkidle0'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(i=>i.decode()));});
  const errors=await page.evaluate(()=>{
   const slide=document.querySelector('.slide').getBoundingClientRect();
   return Array.from(document.querySelectorAll('h1,h2,h3,p,.footer,.reviewrow,.chart-note,.notice,.tokenbox,.conclusion')).filter(el=>{const r=el.getBoundingClientRect();return r.right>slide.right+1||r.bottom>slide.bottom+1||el.scrollWidth>el.clientWidth+2;}).map(el=>el.textContent.slice(0,80));
  });
  const footerGap=await page.evaluate(()=>{const f=document.querySelector('footer');return f?f.getBoundingClientRect().top-f.previousElementSibling.getBoundingClientRect().bottom:null;});
  if(footerGap!==null && footerGap<18) errors.push('Footer gap too small: '+footerGap);
  if(errors.length)throw new Error(file+' overflow: '+JSON.stringify(errors));
  await page.screenshot({path:`output/${file.replace('.html','.png')}`,type:'png'});
  results.push({file,width:1080,height:1440,overflow:errors,footerGap});
  console.log('Rendered',file);
 }
 await page.setViewport({width:1500,height:1650,deviceScaleFactor:1});
 await page.goto(pathToFileURL(path.resolve('index.html')).href,{waitUntil:'networkidle0'});
 await page.screenshot({path:'output/overview.png',fullPage:true});
 await page.setViewport({width:1080,height:1440,deviceScaleFactor:1});
 await page.setContent(`<body style="margin:0;background:#e1e1da;padding:40px;font-family:sans-serif"><h1>手机缩略图检查 · 封面 A / B</h1><div style="display:flex;gap:28px"><img width="240" height="320" src="${pathToFileURL(path.resolve('output/01-cover.png'))}"><img width="240" height="320" src="${pathToFileURL(path.resolve('output/01-cover-b.png'))}"></div></body>`);
 await page.evaluate(async()=>{await Promise.all(Array.from(document.images).map(i=>i.decode()));});
 await page.screenshot({path:'output/cover-thumbnails.png',clip:{x:0,y:0,width:650,height:475}});
 fs.writeFileSync('output/qa.json',JSON.stringify(results,null,2));
 }finally{await browser.close();}
})();
