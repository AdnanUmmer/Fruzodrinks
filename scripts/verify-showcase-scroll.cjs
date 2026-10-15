const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/10adn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const base=process.env.FRUZO_PREVIEW_URL||'http://127.0.0.1:3001';
const out=path.resolve(__dirname,'../qa/showcase-delivery');fs.mkdirSync(out,{recursive:true});
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

 check("no runtime errors",errors.length===0,errors);fs.writeFileSync(path.join(out,"scroll-results.json"),JSON.stringify(results,null,2));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
