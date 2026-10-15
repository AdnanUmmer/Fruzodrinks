const {chromium}=require('C:/Users/10adn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),sharp=require('../frontend/node_modules/sharp');
const dir=path.resolve(__dirname,'../qa/product-accuracy/final'),base='http://127.0.0.1:3000';fs.mkdirSync(dir,{recursive:true});
const centers={mango:136,lemon:136,'lemon-salt':318,cola:294,dew:138,apple:332,pineapple:137,'mixed-fruits':335,'green-apple':327,nannari:138};
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),proof=await browser.newContext({viewport:{width:1440,height:1000}}),p=await proof.newPage();
 await p.goto(base+'/?productProof=front',{waitUntil:'networkidle'});await p.waitForSelector('[data-webgl=true]');await p.locator('#collection').scrollIntoViewIfNeeded();
 const options=await p.locator('#direct-flavour option').evaluateAll(es=>es.map(e=>e.value));const cards=[];
 for(const value of options){
  await p.locator('#direct-flavour').selectOption(value);await p.waitForTimeout(1150);
  const slug=await p.locator('.cinematic-canvas').getAttribute('data-active-flavour'),r=await p.locator('.carousel-stage').boundingBox();
  const screenshot=await p.screenshot();await sharp(screenshot).toFile(path.join(dir,'proof-'+slug+'.png'));
  const src=await sharp(path.resolve(__dirname,'../frontend/public/images/'+slug+'.webp')).extract({left:centers[slug]-136,top:0,width:272,height:675}).resize({height:510}).png().toBuffer();
  const render=await sharp(screenshot).extract({left:605,top:Math.round(r.y+r.height/2-265),width:230,height:540}).resize({height:510}).png().toBuffer();
  const title=Buffer.from('<svg width="460" height="90"><rect width="460" height="90" fill="#fffbed"/><text x="230" y="30" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold">'+slug.toUpperCase()+'</text><text x="112" y="67" text-anchor="middle" font-family="Arial" font-size="16">Catalogue source</text><text x="345" y="67" text-anchor="middle" font-family="Arial" font-size="16">3D front render</text></svg>');
  const card=await sharp({create:{width:460,height:620,channels:4,background:'#fffbed'}}).composite([{input:title,left:0,top:0},{input:src,left:12,top:95},{input:render,left:238,top:95}]).png().toBuffer();
  await sharp(card).toFile(path.join(dir,slug+'-comparison.png'));cards.push({input:card,left:(cards.length%5)*460,top:Math.floor(cards.length/5)*620});
 }
 await sharp({create:{width:2300,height:1240,channels:3,background:'#fffbed'}}).composite(cards).jpeg({quality:92}).toFile(path.join(dir,'all-ten-comparison.jpg'));await proof.close();console.log('Final product comparisons saved');
 const context=await browser.newContext({viewport:{width:1440,height:1000},}),page=await context.newPage();
 const encoder=await browser.newPage({viewport:{width:1280,height:888}});
 await encoder.setContent('<canvas width="1280" height="888"></canvas>');
 await encoder.evaluate(()=>{const canvas=document.querySelector('canvas');window.captureChunks=[];window.captureRecorder=new MediaRecorder(canvas.captureStream(15),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2600000});window.captureRecorder.ondataavailable=e=>{if(e.data.size)window.captureChunks.push(e.data)};window.captureRecorder.start(500)});
 const cdp=await context.newCDPSession(page);let frameQueue=Promise.resolve(),pending=0;
 cdp.on('Page.screencastFrame',frame=>{void cdp.send('Page.screencastFrameAck',{sessionId:frame.sessionId});if(pending>2)return;pending++;frameQueue=frameQueue.then(()=>encoder.evaluate(data=>new Promise(resolve=>{const image=new Image();image.onload=()=>{const canvas=document.querySelector('canvas');canvas.getContext('2d').drawImage(image,0,0,1280,888);resolve()};image.src='data:image/jpeg;base64,'+data}),frame.data)).finally(()=>pending--)});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:1280,maxHeight:888,everyNthFrame:1});
 page.on('pageerror',e=>console.log('ERROR',e.message));await page.goto(base,{waitUntil:'networkidle'});await page.waitForSelector('[data-webgl=true]');await page.waitForTimeout(600);await page.screenshot({path:path.join(dir,'hero-front.png')});
 for(let y=0;y<=2700;y+=90){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(120);if(y===1080){await page.waitForTimeout(650);await page.screenshot({path:path.join(dir,'natural-pour.png')})}}
 for(const [name,y] of [['quarter',1259.3],['rear',1498.5],['three-quarter',1737.7]]){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(750);await page.screenshot({path:path.join(dir,name+'.png')})}
 const anchors=await page.locator('[data-stop]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return r.top+scrollY+r.height/2-innerHeight/2}));
 await page.evaluate(y=>scrollTo(0,y),anchors[1]);await page.waitForTimeout(700);
 for(let i=0;i<=20;i++){await page.evaluate(y=>scrollTo(0,y),anchors[1]+(anchors[2]-anchors[1])*i/20);await page.waitForTimeout(120);if(i===9){await page.waitForTimeout(600);await page.screenshot({path:path.join(dir,'falling-flip.png')})}}
 await page.evaluate(y=>scrollTo(0,y),anchors[3]-80);for(const value of ['0','1','9','5']){await page.locator('#direct-flavour').evaluate((e,value)=>{e.value=value;e.dispatchEvent(new Event('change',{bubbles:true}))},value);await page.waitForTimeout(2600);await page.screenshot({path:path.join(dir,'presentation-'+value+'.png')})}
 await cdp.send('Page.stopScreencast');await frameQueue;
 const encoded=await encoder.evaluate(()=>new Promise(resolve=>{window.captureRecorder.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(window.captureChunks,{type:'video/webm'}))};window.captureRecorder.stop()}));
 fs.writeFileSync(path.join(dir,'cinematic-preview.webm'),Buffer.from(encoded,'base64'));await encoder.close();await context.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1.25}),mp=await mobile.newPage();
 await mp.goto(base,{waitUntil:'networkidle'});await mp.waitForSelector('[data-webgl=true]');await mp.evaluate(()=>scrollTo(0,650));await mp.waitForTimeout(800);await mp.screenshot({path:path.join(dir,'mobile-pour.png')});await mp.locator('#collection').scrollIntoViewIfNeeded();await mp.locator('#direct-flavour').selectOption('0');await mp.waitForTimeout(2600);await mp.screenshot({path:path.join(dir,'mobile-presentation.png')});
 console.log('Mobile overflow',await mp.evaluate(()=>document.documentElement.scrollWidth-innerWidth));await mobile.close();await browser.close();console.log('Preview recording and screenshots saved');
})().catch(e=>{console.error(e);process.exit(1)});

