const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/10adn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const base=process.env.FRUZO_PREVIEW_URL||'http://127.0.0.1:3001';
const out=path.resolve(__dirname,'../qa/product-accuracy/final');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage(),errors=[],results=[];
 const track=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text())})};track(page);
 const check=(name,value,detail)=>{assert.ok(value,name+' '+JSON.stringify(detail));results.push({name,passed:true,detail});console.log('PASS',name)};
 const state=p=>p.locator('.cinematic-canvas').evaluate(e=>({...e.dataset}));
 const move=async(y,delay=850)=>{await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(delay)};
 await page.goto(base,{waitUntil:'networkidle'});await page.waitForSelector('[data-webgl=true]');await page.mouse.move(1300,720);
 await page.mouse.wheel(0,6000);await page.waitForTimeout(450);check('large wheel moderated',await page.evaluate(()=>scrollY)<400);
 await move(0);await page.mouse.wheel(0,100);await page.waitForTimeout(400);check('regular wheel responsive',await page.evaluate(()=>scrollY)>50);
 for(let i=0;i<12;i++){await page.mouse.wheel(0,350);await page.waitForTimeout(70)}await page.waitForTimeout(550);check('repeated fast wheel progresses',await page.evaluate(()=>scrollY)>400);
 for(const [name,y,angle] of [['front',0,0],['quarter',1259.3,90],['rear',1498.5,180],['three-quarter',1737.7,270],['full-turn',2350,360]]){
  await move(y);const s=await state(page);check('360 view '+name,Math.abs(Number(s.rotationDegrees)-angle)<2,s);await page.screenshot({path:path.join(out,name+'.png')});
 }
 await move(1000);check('reverse opens coherently',Number((await state(page)).capOpen)>.98);await move(0);check('reverse closes cap',Number((await state(page)).capOpen)<.01);
 await page.keyboard.press('PageDown');await page.waitForTimeout(400);check('keyboard scroll preserved',await page.evaluate(()=>scrollY)>300);
 await page.locator('.hero-explore').evaluate(e=>e.click());await page.waitForTimeout(1000);check('anchor bypasses wheel limiter',await page.evaluate(()=>scrollY)>3500);
 const anchors=await page.locator('[data-stop]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return r.top+scrollY+r.height/2-innerHeight/2}));
 const start=anchors[1],end=anchors[2];
 for(const [name,fraction] of [['fall-start',0],['fall-mid',.46],['fall-settle',1]]){await move(start+(end-start)*fraction);await page.screenshot({path:path.join(out,name+'.png')});const d=await page.locator('.home-journey').evaluate(e=>({...e.dataset}));if(fraction===.46)check('actual 3D pitch and depth',Number(d.journeyTilt)<-2.4&&Number(d.journeyDepth)<-190,d);if(fraction===1)check('fall settles readable',Math.abs(Number(d.journeyTilt))<.02,d)}
 await move(start+(end-start)*.46);check('reverse falling state',Number(await page.locator('.home-journey').getAttribute('data-journey-tilt'))<-2.4);
 await move(anchors[3]+80);await page.locator('#direct-flavour').selectOption('0');
 const options=await page.locator('#direct-flavour option').evaluateAll(es=>es.map(e=>({value:e.value,label:e.textContent})));
 for(const opt of options){
  await page.locator('#direct-flavour').selectOption(opt.value);
  await page.waitForFunction(()=>Number(document.querySelector('.cinematic-canvas')?.dataset.capOpen)>.99,{},{timeout:8000});
  await page.waitForTimeout(400);const s=await state(page);check('open and persistent '+opt.label,Number(s.liquid)>.98,s);
  check('selected enquiry '+opt.label,(await page.locator('.carousel-actions .text-link').getAttribute('href')).endsWith(s.activeFlavour));
  await page.screenshot({path:path.join(out,'flavour-'+s.activeFlavour+'.png')});
 }
 const before=await page.screenshot();await page.waitForTimeout(1500);const after=await page.screenshot();check('gentle ambient motion persists',!before.equals(after)&&Number((await state(page)).liquid)>.98);
 for(const value of ['0','5','2','9','3','7']){await page.locator('#direct-flavour').selectOption(value);await page.waitForTimeout(60)}
 await page.waitForTimeout(2500);check('rapid changes resolve latest',await page.locator('#direct-flavour').inputValue()==='7'&&Number((await state(page)).capOpen)>.99);
 await page.locator('.carousel-stage').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(2500);check('carousel keyboard',await page.locator('#direct-flavour').inputValue()==='8');
 const box=await page.locator('.carousel-stage').boundingBox();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.45);await page.mouse.down();await page.mouse.move(box.x+box.width*.3,box.y+box.height*.45,{steps:15});await page.mouse.up();await page.waitForTimeout(2500);check('drag resolves open',Number((await state(page)).capOpen)>.99);
 for(const route of ['/about','/products','/faq','/distributor','/contact']){const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});check('page '+route,response.status()===200)}
 await page.goto(base+'/products',{waitUntil:'networkidle'});const productLinks=await page.locator('a[href^="/products/"]').evaluateAll(es=>[...new Set(es.map(e=>e.getAttribute('href')))]);check('ten product routes',productLinks.length===10,productLinks);
 for(const route of productLinks){const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});check('product '+route,response.status()===200)}
 await page.goto(base+'/contact?product=mango',{waitUntil:'networkidle'});check('enquiry preselection',await page.locator('#product').inputValue()==='mango');check('empty form invalid',await page.locator('form').evaluate(e=>!e.checkValidity()));
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1.25});const mp=await mobile.newPage();track(mp);
 await mp.goto(base,{waitUntil:'networkidle'});await mp.waitForSelector('[data-webgl=true]');await mp.evaluate(()=>scrollTo(0,750));await mp.waitForTimeout(850);await mp.screenshot({path:path.join(out,'mobile-hero.png')});check('mobile no overflow',await mp.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
 await mp.locator('#collection').scrollIntoViewIfNeeded();await mp.locator('#direct-flavour').selectOption('0');await mp.waitForTimeout(2600);await mp.screenshot({path:path.join(out,'mobile-carousel.png')});
 const mb=await mp.locator('.carousel-stage').boundingBox(),cdp=await mobile.newCDPSession(mp),cy=Math.max(150,Math.min(700,mb.y+mb.height*.5));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:290,y:cy}]});for(let i=0;i<10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:290-i*18,y:cy}]});await mp.waitForTimeout(25)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mp.waitForTimeout(2600);check('touch swipe',await mp.locator('#direct-flavour').inputValue()!=='0');check('mobile open state',Number((await state(mp)).capOpen)>.99);await mobile.close();
 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),rp=await reduced.newPage();track(rp);await rp.goto(base,{waitUntil:'networkidle'});check('reduced motion static',await rp.locator('.cinematic-canvas').count()===0);check('reduced motion no extended chapter',await rp.locator('.cinematic-chapter').evaluate(e=>e.offsetHeight<1000));await rp.locator('#collection').scrollIntoViewIfNeeded();await rp.locator('#direct-flavour').selectOption('4');check('reduced motion selection',await rp.locator('#direct-flavour').inputValue()==='4');await rp.screenshot({path:path.join(out,'reduced-motion.png')});await reduced.close();
 const fallback=await browser.newContext({viewport:{width:390,height:844}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;return original.call(this,type,...args)}});const fp=await fallback.newPage();await fp.goto(base,{waitUntil:'networkidle'});await fp.waitForTimeout(1200);check('WebGL fallback available',await fp.locator('[data-webgl=true]').count()===0);await fp.locator('#collection').scrollIntoViewIfNeeded();await fp.locator('#direct-flavour').selectOption('3');check('fallback selection works',await fp.locator('#direct-flavour').inputValue()==='3');await fp.screenshot({path:path.join(out,'webgl-fallback.png')});await fallback.close();
 check('no page or shader errors',errors.length===0,errors);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,results,errors},null,2));console.log('CHECKS',results.length);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

