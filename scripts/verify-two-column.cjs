const {chromium}=require('C:/Users/10adn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[],errors=[];
const ok=(name,test)=>{assert(test,name);checks.push(name);console.log('PASS',name)};
const context=await browser.newContext({viewport:{width:1440,height:900}});
const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
await p.goto(base);await p.waitForSelector('[data-video-ready=true]');await p.waitForTimeout(350);
ok('visible original-font heading',await p.locator('h1').isVisible()&&(await p.locator('h1').innerText()).replace(/\s+/g,' ')==='SMALL BOTTLE. BIG HAPPINESS.');
ok('video inside bounded container',await p.locator('.hero-video-frame > video').count()===1);
ok('no floating ingredients or 3D canvas',await p.locator('.flavour-ingredients,.ingredient,canvas,.delivery-chapter').count()===0);
await p.screenshot({path:'qa/two-column/final-desktop-hero.png'});
const duration=await p.locator('video').evaluate(v=>v.duration-.045),distance=900*1.3;
for(const f of [0,.2,.4,.6,.8,1,.8,.4,0]){await p.evaluate(y=>scrollTo(0,y),f*distance);await p.waitForTimeout(500);const v=await p.locator('video').evaluate(v=>({time:v.currentTime,paused:v.paused,top:v.getBoundingClientRect().top,bottom:v.getBoundingClientRect().bottom}));ok('forward/reverse scrub '+f+' at '+v.time.toFixed(2),Math.abs(v.time-duration*f)<.08&&v.paused&&v.top>=85&&v.bottom<=900);if(f===.4)await p.screenshot({path:'qa/two-column/final-desktop-scrub.png'})}
await p.mouse.move(1000,400);await p.mouse.wheel(0,950);let samples=[];for(let i=0;i<15;i++){await p.waitForTimeout(35);samples.push(await p.locator('video').evaluate(v=>v.currentTime))}ok('large native wheel input updates intermediate frames',new Set(samples.map(t=>t.toFixed(2))).size>3);await p.mouse.wheel(0,-950);await p.waitForTimeout(650);ok('fast reverse returns to start',await p.locator('video').evaluate(v=>v.currentTime<.08));
await p.getByRole('link',{name:'Explore our flavours',exact:true}).click();await p.waitForTimeout(350);ok('hero anchor reaches flavours',await p.locator('#collection').evaluate(e=>Math.abs(e.getBoundingClientRect().top-105)<5));
await p.locator('.carousel-stage').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-120));
const select=p.locator('#direct-flavour');const settled=()=>p.waitForFunction(()=>!document.querySelector('.home-journey').dataset.transitioning);
const choose=async i=>{await select.selectOption(String(i));await p.waitForTimeout(150);await settled();};
let heights=[];for(let i=0;i<10;i++){await choose(i);ok('flavour '+i+' loaded and centred',await p.locator('.carousel-bottle[data-active=true]').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.carousel-stage').getBoundingClientRect(),img=e.querySelector('img');return img.complete&&img.naturalWidth>0&&Math.abs(r.x+r.width/2-s.x-s.width/2)<1}));heights.push(await p.locator('#collection').evaluate(e=>e.offsetHeight));}
ok('flavour changes preserve section height',Math.max(...heights)-Math.min(...heights)<=1);
await choose(0);await p.locator('.next-flavour').evaluate(e=>e.click());await p.waitForTimeout(240);let positions=await p.locator('.carousel-bottle').evaluateAll(es=>[0,1].map(i=>new DOMMatrix(getComputedStyle(es[i]).transform).m41));ok('next slides incoming from right / outgoing left',positions[0]<-250&&positions[1]>-250);await p.screenshot({path:'qa/two-column/next-midpoint.png'});await settled();
await p.locator('.previous-flavour').evaluate(e=>e.click());await p.waitForTimeout(240);positions=await p.locator('.carousel-bottle').evaluateAll(es=>[0,1].map(i=>new DOMMatrix(getComputedStyle(es[i]).transform).m41));ok('previous slides incoming from left / outgoing right',positions[0]<-250&&positions[1]>-250);await p.screenshot({path:'qa/two-column/previous-midpoint.png'});await settled();
await p.locator('.previous-flavour').evaluate(e=>e.click());await p.waitForTimeout(100);await settled();ok('previous wraps to last',await select.inputValue()==='9');await p.locator('.next-flavour').evaluate(e=>e.click());await p.waitForTimeout(100);await settled();ok('next wraps to first',await select.inputValue()==='0');
for(const direction of ['next','next','next','next','next','previous','previous']){await p.locator('.'+direction+'-flavour').evaluate(e=>e.click());await p.waitForTimeout(45)}await p.waitForTimeout(1600);ok('rapid mixed navigation resolves latest request',await select.inputValue()==='3');ok('exactly one visible bottle after queue',await p.locator('.carousel-bottle').evaluateAll(es=>es.filter(e=>getComputedStyle(e).visibility==='visible').length)===1);
await p.locator('.carousel-stage').focus();await p.keyboard.press('ArrowLeft');await p.waitForTimeout(850);ok('keyboard selection',await select.inputValue()==='2');
await choose(0);await p.locator('.carousel-stage').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-120));const stage=await p.locator('.carousel-stage').boundingBox();await p.mouse.move(stage.x+stage.width*.65,stage.y+260);await p.mouse.down();await p.mouse.move(stage.x+stage.width*.35,stage.y+260,{steps:12});await p.mouse.up();await p.waitForTimeout(850);ok('desktop drag',await select.inputValue()==='1');
const idle=await select.inputValue();await p.waitForTimeout(4400);ok('manual only, no autoplay',await select.inputValue()===idle);
await p.screenshot({path:'qa/two-column/final-desktop-flavours.png'});
await p.locator('footer').evaluate(e=>scrollTo(0,e.offsetTop-100));await p.screenshot({path:'qa/two-column/final-desktop-footer.png'});
await context.close();
for(const [name,width,height] of [['tablet',1024,768],['portrait-tablet',768,1024],['mobile',390,844],['small-mobile',360,640],['landscape',844,390]]){
 const m=await browser.newPage({viewport:{width,height},isMobile:width<800||height<500,hasTouch:true});m.on('pageerror',e=>errors.push(e.message));await m.goto(base);await m.waitForSelector('[data-video-ready=true]');await m.waitForTimeout(200);
 ok(name+' no page overflow',await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));ok(name+' bounded, visible video',await m.locator('.hero-video-frame').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=72&&r.bottom<=innerHeight}));
 await m.screenshot({path:'qa/two-column/final-'+name+'-hero.png'});
 if(name==='mobile'){
  await m.evaluate(()=>scrollTo(0,844*1.05*.6));await m.waitForTimeout(550);ok('mobile scrub',await m.locator('video').evaluate(v=>Math.abs(v.currentTime-(v.duration-.045)*.6)<.08));await m.evaluate(()=>scrollTo(0,0));await m.waitForTimeout(500);ok('mobile reverse',await m.locator('video').evaluate(v=>v.currentTime<.08));
  await m.locator('.carousel-stage').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-120));const c=await m.context().newCDPSession(m);
  for(const [start,end,expected] of [[320,90,'1'],[90,320,'0']]){await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start,y:360}]});for(let i=1;i<=10;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start+(end-start)*i/10,y:360}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await m.waitForTimeout(850);ok('mobile swipe to '+expected,await m.locator('#direct-flavour').inputValue()===expected)}
  await m.screenshot({path:'qa/two-column/final-mobile-flavours.png'});
  await m.locator('footer').evaluate(e=>scrollTo(0,e.offsetTop-95));await m.screenshot({path:'qa/two-column/final-mobile-footer.png'});
 }
 await m.close();
}
const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(base);await reduced.waitForSelector('[data-static=true]');ok('reduced motion: static frame, no video load or pin',await reduced.locator('video').getAttribute('src')===null&&await reduced.locator('.pin-spacer').count()===0);await reduced.locator('.next-flavour').click();await reduced.waitForTimeout(200);ok('reduced motion: selection remains functional',await reduced.locator('#direct-flavour').inputValue()==='1');await reduced.close();
const fallback=await browser.newPage();await fallback.route('**/vid/hero-section.mp4',r=>r.abort());await fallback.goto(base);await fallback.waitForSelector('[data-static=true]');ok('video error: static fallback, no broken pin',await fallback.locator('.hero-static').isVisible()&&await fallback.locator('.pin-spacer').count()===0);await fallback.close();
ok('no browser runtime errors',errors.length===0);fs.writeFileSync('qa/two-column/results.json',JSON.stringify({base,checks,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
