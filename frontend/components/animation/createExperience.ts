import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Product } from '@/types/catalogue';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);
export function createExperience(root:HTMLDivElement, products:Product[], simple:boolean,
  onChange:(index:number,phase:string)=>void,
  navigation:RefObject<(index:number)=>void>, initialIndex=0) {
  const mm=gsap.matchMedia(root);
  const scenes=Array.from(root.querySelectorAll<HTMLElement>('.flavor-scene'));
  let lastIndex=-1, lastPhase='';
  function current(index:number,phase:string) {
    if(index===lastIndex && phase===lastPhase) return;
    lastIndex=index; lastPhase=phase;
    scenes.forEach((scene,i)=>{
      scene.inert=i!==index;
      scene.setAttribute('aria-hidden',String(i!==index));
      scene.style.contentVisibility=Math.abs(i-index)>1?'hidden':'visible';
    });
    onChange(index,phase);
  }
  mm.add({motion:'(prefers-reduced-motion: no-preference)', reduced:'(prefers-reduced-motion: reduce)', desktop:'(min-width: 800px)', short:'(max-height: 599px)'}, context=>{
    const {motion,desktop,short}=context.conditions!;
    lastIndex=-1; lastPhase='';
    if(!motion || simple || short) {
      root.dataset.mode='simple';
      navigation.current=index=>document.getElementById(`flavor-${products[index].slug}`)?.scrollIntoView({behavior:'instant',block:'start'});
      const observer=new IntersectionObserver(entries=>{
        for(const entry of entries) if(entry.isIntersecting) onChange(scenes.indexOf(entry.target as HTMLElement),'explore');
      },{rootMargin:'-35% 0px -35% 0px'});
      scenes.forEach(scene=>observer.observe(scene));
      const frame=requestAnimationFrame(()=>{if(simple) navigation.current(initialIndex);});
      return ()=>{cancelAnimationFrame(frame);observer.disconnect();delete root.dataset.mode;};
    }
    const stage=root.querySelector<HTMLElement>('.experience-stage')!;
    const hero=root.querySelector('.hero-overlay');
    const assembly=root.querySelector('.assembly-overlay');
    const controls=root.querySelector('.flavor-controls');
    const first=scenes[0];
    const start=2.6;
    const duration=start+products.length-1+0.85;
    // Pin setup briefly collapses the fallback document; preserve restored scroll.
    const restoredScroll=window.scrollY;
    root.dataset.enhanced='true';
    const timeline=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{
      trigger:root, pin:stage, start:'top top', end:()=>`+=${(desktop?650:540)*duration}`,
      scrub:true, invalidateOnRefresh:true, anticipatePin:1,
      onUpdate:self=>{
        const time=self.progress*duration;
        const index=Math.max(0,Math.min(products.length-1,Math.floor(time-start+0.48)));
        current(index,time<0.55?'intro':time<start?'assembly':'explore');
      },
    }});
    gsap.set(scenes,{autoAlpha:0});
    gsap.set(first,{autoAlpha:1});
    gsap.set(scenes.flatMap(s=>Array.from(s.querySelectorAll('.world-title,.product-copy,.size-note,.world-topline,.scene-fruit'))),{autoAlpha:0});
    gsap.set(first.querySelector('.bottle-orbit'),{rotation:9,xPercent:0,y:desktop?0:65,scale:desktop?1.14:0.94});
    gsap.set([assembly,controls],{autoAlpha:0});
    timeline.to(hero,{autoAlpha:0,y:-70,duration:.6},.05)
      .to(first.querySelector('.bottle-orbit'),{rotation:0,scale:.88,y:0,xPercent:desktop?24:0,duration:.65},.1)
      .to(first.querySelector('.bottle-ghost'),{opacity:.45,duration:.2},.5)
      .to(first.querySelector('.bottle-colour'),{clipPath:'inset(100% 0% 0% 0%)',duration:.32},.45)
      .fromTo(assembly,{y:50},{autoAlpha:1,y:0,duration:.45},.65)
      .fromTo('.ingredient-one',{x:-120,y:100,rotation:-40,scale:.7},{x:10,y:-50,rotation:12,scale:1,duration:1.1},.75)
      .fromTo('.ingredient-two',{x:130,y:-80,rotation:35},{x:0,y:10,rotation:-15,duration:1.1},.75)
      .to(first.querySelector('.bottle-colour'),{clipPath:'inset(0% 0% 0% 0%)',duration:1.05},1.05)
      .to(first.querySelector('.bottle-ghost'),{opacity:0,duration:.2},2.05)
      .to(assembly,{autoAlpha:0,y:-35,duration:.35},2.12)
      .to(first.querySelector('.bottle-orbit'),{xPercent:0,rotation:-5,scale:1,duration:.45},2.15)
      .to(first.querySelectorAll('.world-title,.product-copy,.size-note,.world-topline,.scene-fruit'),{autoAlpha:1,duration:.35},2.2)
      .to(controls,{autoAlpha:1,duration:.25},2.25)
      .to('.ingredient-one',{autoAlpha:0,x:-80,y:60,rotation:30,duration:.3},2.25)
      .to('.ingredient-two',{autoAlpha:0,x:80,y:-40,rotation:-30,duration:.3},2.25);
    for(let i=1;i<scenes.length;i++) {
      const at=start+i-.62, previous=scenes[i-1], next=scenes[i];
      timeline.to(previous.querySelector('.bottle-orbit'),{xPercent:-75,scale:.68,rotation:-20,autoAlpha:0,duration:.65},at)
        .to(previous.querySelectorAll('.world-title,.product-copy,.size-note,.world-topline'),{autoAlpha:0,y:-25,duration:.32},at)
        .to(previous,{autoAlpha:0,duration:.5},at+.18)
        .fromTo(next,{autoAlpha:0},{autoAlpha:1,duration:.5},at+.05)
        .fromTo(next.querySelector('.bottle-orbit'),{xPercent:75,scale:.68,rotation:22},{xPercent:0,scale:1,rotation:i%2?5:-5,autoAlpha:1,duration:.65},at+.05)
        .fromTo(next.querySelector('.world-title'),{y:45,scale:.92},{autoAlpha:1,y:0,scale:1,duration:.55},at+.13)
        .fromTo(next.querySelectorAll('.product-copy,.size-note,.world-topline'),{y:20},{autoAlpha:1,y:0,duration:.35},at+.36);
      const prevFruit=previous.querySelector('.scene-fruit'), nextFruit=next.querySelector('.scene-fruit');
      if(prevFruit) timeline.to(prevFruit,{autoAlpha:0,x:-120,rotation:-35,duration:.5},at);
      if(nextFruit) timeline.fromTo(nextFruit,{x:100,rotation:35,autoAlpha:0},{x:0,rotation:-12,autoAlpha:1,duration:.6},at+.1);
    }
    // A short final hold; release into the bottle lineup without an abrupt cut.
    timeline.to(scenes.at(-1)!.querySelector('.bottle-orbit'),{scale:.82,y:35,duration:.5},duration-.5);
    timeline.to({}, {duration:.001},duration);
    navigation.current=index=>{
      const trigger=timeline.scrollTrigger;
      if(!trigger) return;
      const target=trigger.start+(start+index+.04)/duration*(trigger.end-trigger.start);
      window.scrollTo({top:target,behavior:'smooth'});
    };
    const tiltNodes=scenes.map(s=>s.querySelector<HTMLElement>('.bottle-tilt')!);
    const setTilt=tiltNodes.map(n=>({x:gsap.quickTo(n,'rotationY',{duration:.5,ease:'power2.out'}),y:gsap.quickTo(n,'rotationX',{duration:.5,ease:'power2.out'})}));
    const move=(event:PointerEvent)=>{
      if(event.pointerType!=='mouse'||!desktop) return;
      const rect=stage.getBoundingClientRect();
      setTilt[Math.max(0,lastIndex)]?.x((event.clientX/rect.width-.5)*4);
      setTilt[Math.max(0,lastIndex)]?.y(-(event.clientY/rect.height-.5)*3);
    };
    const leave=()=>{setTilt.forEach(n=>{n.x(0);n.y(0);});};
    stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);
    ScrollTrigger.refresh();
    window.scrollTo({top:restoredScroll,behavior:'instant'});
    ScrollTrigger.update();
    const time=(timeline.scrollTrigger?.progress || 0)*duration;
    current(Math.max(0,Math.min(products.length-1,Math.floor(time-start+0.48))),time<0.55?'intro':time<start?'assembly':'explore');
    return ()=>{
      stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);
      delete root.dataset.enhanced;
      scenes.forEach(scene=>{scene.inert=false;scene.removeAttribute('aria-hidden');scene.style.contentVisibility='';});
    };
  });
  return ()=>{mm.revert();navigation.current=()=>{};};
}
