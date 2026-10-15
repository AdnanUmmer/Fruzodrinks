import gsap from 'gsap';
import type {Product} from '@/types/catalogue';

/** Manual slides. Finish the visible motion before resolving the latest request. */
export function createHomeExperience(root:HTMLDivElement,products:Product[],simple:boolean,onSelect:(index:number)=>void){
 const stage=root.querySelector<HTMLElement>('.carousel-stage')!;
 const bottles=Array.from(root.querySelectorAll<HTMLElement>('.carousel-bottle'));
 const preference=matchMedia('(prefers-reduced-motion:reduce)');
 const reduced=()=>simple||preference.matches;
 let selected=0,requested=0,direction=1,busy=false,disposed=false;
 let slide:gsap.core.Timeline|undefined,drag:{x:number;y:number;active:boolean}|undefined,clickTimer:ReturnType<typeof setTimeout>|undefined;
 const wrap=(n:number)=>(n%products.length+products.length)%products.length;
 const prepare=(index:number)=>{const img=bottles[wrap(index)].querySelector('img');if(!img)return Promise.resolve();img.loading='eager';return img.decode().catch(()=>{})};
 const settle=()=>{
  bottles.forEach((b,i)=>gsap.set(b,{xPercent:-50,yPercent:-50,x:0,y:0,scale:1,autoAlpha:i===selected?1:0}));
  void prepare(selected+1);void prepare(selected-1);
 };
 const advance=async()=>{
  if(disposed||busy||requested===selected)return;
  busy=true;const target=requested,travel=direction;
  // Do not slide an undecoded image into view, even on a cold connection.
  await prepare(target);
  if(disposed)return;
  if(target!==requested){busy=false;void advance();return}
  const previous=selected;selected=target;onSelect(target);
  root.dataset.direction=String(travel);root.dataset.transitioning='true';
  const finish=()=>{settle();busy=false;delete root.dataset.transitioning;void advance()};
  if(reduced()){finish();return}
  const distance=Math.max(stage.clientWidth*.55,bottles[target].clientWidth*1.15);
  gsap.set(bottles[target],{xPercent:-50,yPercent:-50,x:travel*distance,y:0,autoAlpha:0});
  slide=gsap.timeline({onComplete:finish})
   .to(bottles[previous],{x:-travel*distance,duration:.68,ease:'power2.inOut'},0)
   .to(bottles[previous],{opacity:0,duration:.55,ease:'power1.inOut'},.08)
   .to(bottles[target],{x:0,duration:.68,ease:'power2.inOut'},0)
   .to(bottles[target],{autoAlpha:1,duration:.5,ease:'power1.inOut'},.06);
 };
 const choose=(index:number,step?:-1|1)=>{
  const target=wrap(step?requested+step:index);
  if(target===requested)return;
  let delta=target-requested;
  if(delta>products.length/2)delta-=products.length;if(delta<-products.length/2)delta+=products.length;
  direction=step||Math.sign(delta)||1;requested=target;void advance();
 };
 const down=(e:PointerEvent)=>{if(e.button!==0||(e.target instanceof Element&&e.target.closest('button,select')))return;drag={x:e.clientX,y:e.clientY,active:false};clearTimeout(clickTimer);delete root.dataset.dragged};
 const move=(e:PointerEvent)=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.active){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){drag=undefined;return}if(Math.abs(dx)<10)return;drag.active=true;stage.setPointerCapture(e.pointerId);root.dataset.dragged='true'}e.preventDefault()};
 const end=(e:PointerEvent)=>{if(!drag)return;const dx=e.clientX-drag.x,active=drag.active;drag=undefined;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(active&&e.type!=='pointercancel'&&Math.abs(dx)>35)choose(requested,dx<0?1:-1);clickTimer=setTimeout(()=>delete root.dataset.dragged,150)};
 const preventNativeDrag=(e:DragEvent)=>e.preventDefault();
 const motionChanged=()=>{if(reduced())slide?.progress(1)};
 settle();root.dataset.carouselReady='true';stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);stage.addEventListener('dragstart',preventNativeDrag);preference.addEventListener('change',motionChanged);
 return{choose,dispose:()=>{disposed=true;slide?.kill();clearTimeout(clickTimer);stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerup',end);stage.removeEventListener('pointercancel',end);stage.removeEventListener('dragstart',preventNativeDrag);preference.removeEventListener('change',motionChanged);delete root.dataset.carouselReady;delete root.dataset.dragged;delete root.dataset.transitioning;gsap.set(bottles,{clearProps:'all'})}};
}
