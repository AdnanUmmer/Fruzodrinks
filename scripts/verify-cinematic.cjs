/* Read-only browser verification: never submits an enquiry or sends email. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/10adn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../qa/cinematic-final');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage(),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 const check=(name,value,detail)=>{assert.ok(value,name+': '+JSON.stringify(detail));results.push({name,passed:true,detail});console.log('PASS',name)};
 const state=()=>page.locator('.cinematic-canvas').evaluate(e=>({...e.dataset}));
 await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});await page.waitForSelector('[data-webgl=true]');
 await page.mouse.move(1200,700);await page.mouse.wheel(0,6000);await page.waitForTimeout(550);
 const limited=await page.evaluate(()=>scrollY);check('large wheel limited inside hero',limited>100&&limited<400,limited);
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(700);await page.mouse.wheel(0,100);await page.waitForTimeout(400);check('regular wheel remains responsive',await page.evaluate(()=>scrollY)>50);
 for(const [name,y,angle] of [['front',0,0],['quarter',1259.3,90],['rear',1498.5,180],['three-quarter',1737.7,270],['full-turn',2350,360]]){
  await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(850);const s=await state();check('angle '+name,Math.abs(Number(s.rotationDegrees)-angle)<2,s);
  await page.screenshot({path:path.join(out,name+'.png')});
 }
 await page.evaluate(()=>scrollTo(0,1259));await page.waitForTimeout(800);check('reverse rotation',Math.abs(Number((await state()).rotationDegrees)-90)<2);
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(800);check('reverse closes cap',Number((await state()).capOpen)<.01);
 await page.keyboard.press('PageDown');await page.waitForTimeout(400);check('keyboard scroll allowed',await page.evaluate(()=>scrollY)>300);
 await page.locator('a.hero-explore').evaluate(e=>e.click());await page.waitForTimeout(1200);check('anchor navigation bypasses limiter',await page.evaluate(()=>scrollY)>3500);
 await page.locator('#direct-flavour').selectOption('0');await page.waitForTimeout(3000);
 const options=await page.locator('#direct-flavour option').evaluateAll(es=>es.map(e=>({value:e.value,label:e.textContent})));
 for(const opt of options){
  await page.locator('#direct-flavour').selectOption(opt.value);await page.waitForTimeout(2500);const s=await state();
  check('persistent open '+opt.label,Number(s.capOpen)>.98&&Number(s.liquid)>.95,s);
  const href=await page.locator('.carousel-actions .text-link').getAttribute('href');check('enquiry selection '+opt.label,href.endsWith(s.activeFlavour),href);
  await page.screenshot({path:path.join(out,'flavour-'+s.activeFlavour+'.png')});
 }
 await page.waitForTimeout(3000);check('effects persist after entrance',Number((await state()).liquid)>.95);
 for(const value of ['0','5','2','9','3','7']){await page.locator('#direct-flavour').selectOption(value);await page.waitForTimeout(75)}
 await page.waitForTimeout(3000);check('rapid selection resolves to latest',Number((await state()).capOpen)>.98&&await page.locator('#direct-flavour').inputValue()==='7',await state());
 const stage=page.locator('.carousel-stage');await stage.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(2500);check('carousel keyboard selection',await page.locator('#direct-flavour').inputValue()==='8');
 const box=await stage.boundingBox();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.3,box.y+box.height*.5,{steps:14});await page.mouse.up();await page.waitForTimeout(2800);check('drag settles open',Number((await state()).capOpen)>.98);
 for(const route of ['/about','/products','/faq','/distributor','/contact',...options.map(o=>'/products/'+({'0':'mango'}[o.value]||''))].filter((r,i,all)=>all.indexOf(r)===i&&r!='/products/')){
  const response=await page.goto('http://127.0.0.1:3000'+route,{waitUntil:'domcontentloaded'});check('route '+route,response.status()===200);
 }
 await page.goto('http://127.0.0.1:3000/products',{waitUntil:'networkidle'});
 const productLinks=await page.locator('a[href^="/products/"]').evaluateAll(es=>[...new Set(es.map(e=>e.getAttribute('href')))]);
 check('ten product routes',productLinks.length>=10,productLinks);
 for(const route of productLinks){const response=await page.goto('http://127.0.0.1:3000'+route,{waitUntil:'domcontentloaded'});check(route,response.status()===200)}
 await page.goto('http://127.0.0.1:3000/contact?product=mango',{waitUntil:'networkidle'});
 check('contact product preselected',await page.locator('select').evaluateAll(es=>es.some(e=>e.value==='mango')));
 check('empty contact form invalid',await page.locator('form').evaluate(e=>!e.checkValidity()));
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1.25});
 const mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(e.message));await mp.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});await mp.waitForSelector('[data-webgl=true]');
 await mp.evaluate(()=>scrollTo(0,900));await mp.waitForTimeout(900);await mp.screenshot({path:path.join(out,'mobile-hero.png')});check('mobile no horizontal overflow',await mp.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
 await mp.locator('#collection').scrollIntoViewIfNeeded();await mp.locator('#direct-flavour').selectOption('0');await mp.waitForTimeout(3200);await mp.screenshot({path:path.join(out,'mobile-carousel.png')});
 const mb=await mp.locator('.carousel-stage').boundingBox(),cdp=await mobile.newCDPSession(mp);
 const cy=Math.max(180,Math.min(700,mb.y+mb.height/2));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:290,y:cy}]});
 for(let i=0;i<10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:290-i*18,y:cy}]});await mp.waitForTimeout(25)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mp.waitForTimeout(3000);
 check('mobile touch swipe changes flavour',await mp.locator('#direct-flavour').inputValue()!=='0');
 check('mobile centre stays open',Number(await mp.locator('.cinematic-canvas').getAttribute('data-cap-open'))>.98);
 await mobile.close();
 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});check('reduced motion skips WebGL',await rp.locator('.cinematic-canvas').count()===0);check('reduced motion removes extended chapter',await rp.locator('.cinematic-chapter').evaluate(e=>e.offsetHeight<1000));await rp.locator('#collection').scrollIntoViewIfNeeded();await rp.locator('#direct-flavour').selectOption('4');check('reduced motion carousel usable',await rp.locator('#direct-flavour').inputValue()==='4');await rp.screenshot({path:path.join(out,'reduced-motion.png')});await reduced.close();
 check('no runtime errors',errors.length===0,errors);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

