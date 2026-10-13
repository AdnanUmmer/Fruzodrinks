import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {cinematicConfig,installHeroWheelLimiter} from './cinematicConfig';
import type {Product} from '@/types/catalogue';
gsap.registerPlugin(ScrollTrigger);

export function createHomeExperience(root:HTMLDivElement,products:Product[],simple:boolean,onSelect:(index:number)=>void){
 const stage=root.querySelector<HTMLElement>('.carousel-stage')!;
 const bottles=Array.from(root.querySelectorAll<HTMLElement>('.carousel-bottle'));
 const traveller=root.querySelector<HTMLElement>('.travelling-bottle')!;
 const anchors=Array.from(root.querySelectorAll<HTMLElement>('[data-stop]'));
 const media=gsap.matchMedia(root);const position={value:0};let selected=0;let tween:gsap.core.Tween|undefined;let disposed=false;
 let selectImpl:(index:number)=>void=()=>{};
 const wrap=(n:number)=>((n%products.length)+products.length)%products.length;
 media.add({all:'(min-width:0px)',desktop:'(min-width:800px)',reduced:'(prefers-reduced-motion:reduce)'},context=>{
  const reduced=!!context.conditions?.reduced||simple;
  const desktop=!!context.conditions?.desktop;
  const chapter=root.querySelector<HTMLElement>('.cinematic-chapter')!;
  const hero=root.querySelector<HTMLElement>('.evolution-hero')!;
  const abort=new AbortController();let disposeScene:(()=>void)|undefined;
  let cinemaDistance=0;
  const sizeChapter=()=>{cinemaDistance=reduced?0:window.innerHeight*(desktop?cinematicConfig.hero.desktopScreens:cinematicConfig.hero.mobileScreens);chapter.style.height=reduced?'auto':(hero.offsetHeight+cinemaDistance)+'px'};
  sizeChapter();
  const removeWheelLimiter=installHeroWheelLimiter(chapter,()=>cinemaDistance,reduced);
  if(!reduced){void import('./createCinematic').then(m=>m.createCinematic(root,products,abort.signal)).then(cleanup=>{if(abort.signal.aborted)cleanup();else disposeScene=cleanup}).catch(()=>{delete root.dataset.webgl})}
  const reveal=(index:number)=>{root.dataset.userDock='true';root.dataset.docked='true';traveller.style.visibility='hidden';root.dispatchEvent(new CustomEvent('cinematic-flavour',{detail:products[index].slug}))};
  let gap=0,width=0,height=0;let drag:{x:number;y:number;position:number;started:boolean}|null=null;
  let clickTimer:ReturnType<typeof setTimeout>|undefined;
  const size=()=>{width=parseFloat(getComputedStyle(stage).getPropertyValue('--bottle-width'));height=width*800/540;gap=stage.clientWidth*(desktop?.29:.42)};
  const render=()=>{bottles.forEach((b,i)=>{const delta=((i-position.value+products.length*1.5)%products.length+products.length)%products.length-products.length*.5;const distance=Math.abs(delta);gsap.set(b,{xPercent:0,yPercent:0,x:delta*gap-width/2,y:-height/2+Math.min(distance,2)*(desktop?45:22),scale:Math.max(.30,1-distance*.52),rotation:delta*5,opacity:Math.min(1,Math.max(0,1-distance*.30)),zIndex:10-Math.round(distance*2),visibility:distance>2.3?'hidden':'visible'});b.style.pointerEvents=distance>1.6?'none':'auto'})};
  const select=(index:number)=>{const target=wrap(index);const current=wrap(Math.round(position.value));let delta=target-current;if(delta>products.length/2)delta-=products.length;if(delta<-products.length/2)delta+=products.length;
   selected=target;onSelect(target);reveal(target);tween?.kill();
   const end=Math.round(position.value)+delta;
   if(reduced){position.value=end;render()}else{tween=gsap.to(position,{value:end,duration:cinematicConfig.carousel.slideSeconds,ease:'power3.inOut',onUpdate:render});gsap.fromTo(root.querySelector('.carousel-description'),{y:12,opacity:.35},{y:0,opacity:1,duration:.55,overwrite:true});}
  };
  selectImpl=select;size();position.value=selected;render();root.dataset.carouselReady='true';
  const down=(event:PointerEvent)=>{if(event.button!==0||event.target instanceof Element&&event.target.closest('button,select'))return;drag={x:event.clientX,y:event.clientY,position:position.value,started:false};delete root.dataset.dragged;clearTimeout(clickTimer)};
  const move=(event:PointerEvent)=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.started){if(Math.abs(dy)>15&&Math.abs(dy)>Math.abs(dx)){drag=null;return}if(Math.abs(dx)<8)return;drag.started=true;stage.setPointerCapture(event.pointerId);tween?.kill();root.dataset.dragged='true'}event.preventDefault();position.value=drag.position-dx/gap;render()};
  const end=(event:PointerEvent)=>{if(!drag)return;const moved=drag.started;drag=null;if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);if(moved){const target=Math.round(position.value);selected=wrap(target);onSelect(selected);reveal(selected);tween?.kill();tween=gsap.to(position,{value:target,duration:reduced?0:.45,ease:'power2.out',onUpdate:render});clickTimer=setTimeout(()=>{delete root.dataset.dragged},100)}};
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  const motion={tilt:0,turn:0,depth:0};
  const publishMotion=()=>{root.dataset.journeyTilt=String(motion.tilt);root.dataset.journeyTurn=String(motion.turn);root.dataset.journeyDepth=String(motion.depth)};
  let timeline:gsap.core.Timeline|undefined;let trigger:ScrollTrigger|undefined;
  const measure=(i:number)=>{if(i===0)return{x:root.clientWidth/2-200,y:hero.offsetHeight*(desktop?.51:.57)-800/540*200,scale:anchors[0].offsetWidth/400,centreY:hero.offsetHeight*(desktop?.51:.57)};const a=anchors[i].getBoundingClientRect(),r=root.getBoundingClientRect();return{x:a.left-r.left+a.width/2-200,y:a.top-r.top+a.height/2-800/540*200,scale:a.width/400,centreY:a.top-r.top+a.height/2}};
  const build=()=>{if(!timeline)return;timeline.clear();const initial=measure(0);gsap.set(traveller,{x:initial.x,y:initial.y,scale:initial.scale,rotation:9});gsap.set(motion,{tilt:0,turn:0,depth:0});publishMotion();let previous=cinemaDistance;timeline.to(traveller,{y:initial.y+cinemaDistance,rotation:0,duration:cinemaDistance,ease:'none'},0);
   const points:{x:number;y:number;scale:number;centreY:number;rotation:number}[]=[];
   for(let i=1;i<anchors.length;i++){
    if(!desktop&&i<3){const section=anchors[i].closest('.journey-section')!;const copy=section.querySelector('.journey-copy')!.getBoundingClientRect();const r=root.getBoundingClientRect();const cx=root.clientWidth-46;
     for(const cy of [copy.top-r.top+65,copy.bottom-r.top+55]) points.push({x:cx-200,y:cy-800/540*200,scale:.2,centreY:cy,rotation:0});
    }
    points.push({...measure(i),rotation:[9,-8,6,0][i]});
   }
   let last={...initial,y:initial.y+cinemaDistance,rotation:0};
   for(const [j,point] of points.entries()){
    const at=Math.max(previous+1,point.centreY-window.innerHeight*.5),duration=at-previous;
    const curve=desktop?[68,-85,48][j%3]:0;
    timeline.to(traveller,{x:(last.x+point.x)/2+curve,y:last.y+(point.y-last.y)*.52,scale:(last.scale+point.scale)/2*.96,rotation:desktop?[17,-13,9][j%3]:point.rotation,duration:duration*.52,ease:'power1.in'},previous);
    timeline.to(traveller,{x:point.x,y:point.y,scale:point.scale,rotation:point.rotation,duration:duration*.48,ease:'power1.out'},previous+duration*.52);
    timeline.to(motion,{tilt:[-.22,.18,-.12][j%3]*(desktop?1:.45),turn:[.85,-.65,.4][j%3],depth:[-100,70,-45][j%3]*(desktop?1:.35),duration:duration*.52,ease:'power1.inOut'},previous);
    timeline.to(motion,{tilt:0,turn:0,depth:0,duration:duration*.48,ease:'power2.out'},previous+duration*.52);
    previous=at;last=point;
   }
  };
  if(!reduced){timeline=gsap.timeline({paused:true,onUpdate:publishMotion});build();root.dataset.journeyReady='true';trigger=ScrollTrigger.create({trigger:root,start:'top top',end:()=>'+='+Math.max(1,measure(3).centreY-window.innerHeight*.5),animation:timeline,scrub:true,invalidateOnRefresh:true,onRefreshInit:build,onUpdate:self=>{if(stage.getBoundingClientRect().top>innerHeight*.7)delete root.dataset.userDock;const docked=self.progress>=.999||root.dataset.userDock==='true';root.dataset.docked=String(docked);traveller.style.visibility=docked?'hidden':'visible'},onRefresh:self=>{if(stage.getBoundingClientRect().top>innerHeight*.7)delete root.dataset.userDock;const docked=self.progress>=.999||root.dataset.userDock==='true';root.dataset.docked=String(docked);traveller.style.visibility=docked?'hidden':'visible'}})}
  else{root.dataset.docked='true'}
  const cinemaState={progress:0};
  let cinemaTween:gsap.core.Tween|undefined;
  const caption=root.querySelector<HTMLElement>('.cinematic-caption')!;
  const line=root.querySelector<HTMLElement>('.cinematic-line')!;
  const heroText=hero.querySelectorAll('.evolution-title,.evolution-hero-note,.hero-explore,.hero-fruit,.hero-leaf');
  let cinemaTrigger:ScrollTrigger|undefined;
  if(!reduced){
   const updateCinema=()=>{const p=cinemaState.progress;root.dataset.cinematicProgress=String(p);gsap.set(heroText,{opacity:1-gsap.utils.clamp(0,1,(p-.05)/.16)});gsap.set(caption,{opacity:Math.min(1,p*9)*(1-gsap.utils.clamp(0,1,(p-.86)/.14))});gsap.set(caption.querySelector('i'),{scaleX:p});line.textContent=p<.26?'A LITTLE GOLDEN ESCAPE.':p<.65?'A WHIRL OF COLOUR.':'REFRESHING. EVERY ANGLE.'};
   cinemaTween=gsap.to(cinemaState,{progress:1,duration:1,ease:'none',paused:true,onUpdate:updateCinema});
   cinemaTrigger=ScrollTrigger.create({trigger:chapter,start:'top top',end:()=>'+='+cinemaDistance,animation:cinemaTween,scrub:cinematicConfig.hero.scrubSeconds});
  }
  const refresh=()=>{sizeChapter();size();render();cinemaTrigger?.refresh();trigger?.refresh()};window.addEventListener('resize',refresh);
  void document.fonts.ready.then(()=>{if(!disposed)refresh()});
  return()=>{removeWheelLimiter();cinemaTween?.kill();abort.abort();disposeScene?.();cinemaTrigger?.kill();chapter.style.height="";delete root.dataset.cinematicProgress;delete root.dataset.userDock;delete root.dataset.journeyTilt;delete root.dataset.journeyTurn;delete root.dataset.journeyDepth;gsap.set(heroText,{clearProps:"opacity"});gsap.set(caption,{clearProps:"all"});clearTimeout(clickTimer);tween?.kill();trigger?.kill();timeline?.kill();window.removeEventListener('resize',refresh);stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerup',end);stage.removeEventListener('pointercancel',end);delete root.dataset.journeyReady;delete root.dataset.docked;delete root.dataset.carouselReady;delete root.dataset.dragged;gsap.set(traveller,{clearProps:'all'});bottles.forEach(b=>gsap.set(b,{clearProps:'all'}))};
 });
 return {choose:(index:number)=>selectImpl(index),dispose:()=>{disposed=true;media.revert()}};
}
