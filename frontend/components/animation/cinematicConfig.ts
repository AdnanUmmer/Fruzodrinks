/** Preview tuning: wheelLimiter.enabled=false disables wheel moderation entirely.
 * ?wheelLimiter=off also disables it for a single preview session. */
export const cinematicConfig = {
 hero: {desktopScreens:2.7,mobileScreens:1.9,scrubSeconds:.38},
 wheelLimiter: {enabled:true,threshold:220,maxDelta:260,duration:.22},
 carousel: {slideSeconds:.9,openSeconds:1.35,closeSeconds:.28,neighbourScale:.48,neighbourOpacity:.68},
 rendering: {desktopDpr:1.5,mobileDpr:1.2,mobileFps:30},
} as const;

export function installHeroWheelLimiter(chapter:HTMLElement,distance:()=>number,disabled:boolean){
 let frame=0,start=0,from=0,target=0;
 const stop=()=>{cancelAnimationFrame(frame);frame=0};
 const allowed=cinematicConfig.wheelLimiter.enabled&&!disabled&&new URLSearchParams(location.search).get('wheelLimiter')!=='off';
 if(!allowed)return()=>{};
 const tick=(now:number)=>{const p=Math.min(1,(now-start)/(cinematicConfig.wheelLimiter.duration*1000));window.scrollTo(0,from+(target-from)*(1-Math.pow(1-p,3)));if(p<1)frame=requestAnimationFrame(tick);else frame=0};
 const wheel=(e:WheelEvent)=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  if(e.target instanceof Element&&e.target.closest('input,textarea,select,[data-native-scroll]'))return;
  const top=chapter.getBoundingClientRect().top+scrollY,end=top+distance();
  if(scrollY<top||scrollY>=end||scrollY<=top&&e.deltaY<0){stop();return}
  const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(Math.abs(dy)<=cinematicConfig.wheelLimiter.threshold){stop();return}
  e.preventDefault();stop();from=scrollY;target=Math.max(top,Math.min(end+32,from+Math.sign(dy)*cinematicConfig.wheelLimiter.maxDelta));start=performance.now();frame=requestAnimationFrame(tick);
 };
 window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',stop);window.addEventListener('touchstart',stop,{passive:true});window.addEventListener('pointerdown',stop);
 return()=>{stop();window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',stop);window.removeEventListener('touchstart',stop);window.removeEventListener('pointerdown',stop)};
}

