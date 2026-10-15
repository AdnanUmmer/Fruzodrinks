const {chromium}=require('C:/Users/10adn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});
for(const [name,width,height] of [['desktop',1440,900],['tablet',1024,768],['portrait-tablet',768,1024],['mobile',390,844],['small-mobile',360,640]]){
 const p=await browser.newPage({viewport:{width,height}});await p.goto('http://127.0.0.1:3000/');await p.waitForSelector('[data-video-ready="true"]');await p.waitForTimeout(500);
 console.log(name,await p.evaluate(()=>{const frame=document.querySelector('.hero-video-frame').getBoundingClientRect(),h=document.querySelector('h1').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,frame:{x:frame.x,y:frame.y,width:frame.width,height:frame.height,bottom:frame.bottom},heading:{x:h.x,y:h.y,width:h.width,height:h.height},heroHeight:document.querySelector('.video-hero').getBoundingClientRect().height}}));
 await p.screenshot({path:'qa/two-column/'+name+'-hero.png'});
 const d=height*(width<800?1.05:1.3);for(const f of [.25,.5,1,.5,0]){await p.evaluate(y=>scrollTo(0,y),d*f);await p.waitForTimeout(650);const state=await p.locator('video').evaluate(v=>({time:v.currentTime,duration:v.duration,paused:v.paused,rect:v.getBoundingClientRect().toJSON()}));console.log(name,f,JSON.stringify(state));}
 await p.locator('#collection').scrollIntoViewIfNeeded();await p.locator('.carousel-stage').scrollIntoViewIfNeeded();await p.screenshot({path:'qa/two-column/'+name+'-flavours.png'});await p.locator('footer').scrollIntoViewIfNeeded();await p.screenshot({path:'qa/two-column/'+name+'-footer.png'});await p.close();
}await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
