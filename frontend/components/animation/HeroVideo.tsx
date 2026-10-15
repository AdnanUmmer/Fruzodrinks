'use client';
import {useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HeroVideo(){
 const chapter=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
 const [simple,setSimple]=useState(false);
 useEffect(()=>{
  const el=chapter.current!,v=video.current!,media=gsap.matchMedia();
  media.add({all:'(min-width:0px)',mobile:'(max-width:799px)',reduced:'(prefers-reduced-motion:reduce)'},context=>{
   const staticMode=!!context.conditions?.reduced||simple;
   el.dataset.static=String(staticMode);
   if(staticMode){v.removeAttribute('src');v.load();return}
   let disposed=false,target=0,displayed=0,frame=0,lastTime=0,trigger:ScrollTrigger|undefined;
   // One writer, one seek in flight. Coalesce input while the decoder is busy.
   const tick=(now:number)=>{
    frame=0;
    if(disposed||document.hidden||v.readyState<2||!Number.isFinite(v.duration))return;
    const dt=lastTime?Math.min(now-lastTime,64):16;lastTime=now;
    displayed+=(target-displayed)*(1-Math.exp(-dt/80));
    if(Math.abs(target-displayed)<.001)displayed=target;
    const desired=displayed*Math.max(0,v.duration-.045);
    el.style.setProperty('--video-progress',String(displayed));
    if(!v.seeking&&Math.abs(v.currentTime-desired)>1/90)v.currentTime=desired;
    if(displayed!==target)queue();
   };
   const queue=()=>{if(!disposed&&!frame&&!document.hidden)frame=requestAnimationFrame(tick)};
   const ready=()=>{
    if(disposed||trigger)return;
    el.dataset.videoReady='true';
    trigger=ScrollTrigger.create({trigger:el,start:'top top',
     end:()=>'+='+Math.round(innerHeight*(context.conditions?.mobile?1.05:1.3)),
     pin:el.querySelector('.video-hero'),pinSpacing:true,invalidateOnRefresh:true,
     onUpdate:self=>{target=self.progress;queue()},
     onRefresh:self=>{target=self.progress;queue()}});
    queue();
   };
   const error=()=>{el.dataset.static='true';trigger?.kill();cancelAnimationFrame(frame)};
   v.addEventListener('loadeddata',ready);v.addEventListener('seeked',queue);v.addEventListener('error',error);
   document.addEventListener('visibilitychange',queue);
   v.src='/vid/hero-section.mp4';v.load();if(v.readyState>=2)ready();
   return()=>{disposed=true;cancelAnimationFrame(frame);trigger?.kill();v.removeEventListener('loadeddata',ready);v.removeEventListener('seeked',queue);v.removeEventListener('error',error);document.removeEventListener('visibilitychange',queue);delete el.dataset.videoReady;el.style.removeProperty('--video-progress')};
  });return()=>media.revert();
 },[simple]);
 return <section ref={chapter} className="video-chapter" aria-labelledby="hero-heading">
  <div className="video-hero">
   <div className="hero-copy">
    <span className="eyebrow">FRUZO · REFRESHING EVERY MOMENT</span>
    <h1 id="hero-heading"><span>SMALL<br/> BOTTLE.</span><span>BIG<br/> HAPPINESS.</span></h1>
    <a className="pill-button" href="#collection">Explore our flavours</a>
   </div>
   <div className="hero-media">
    <div className="hero-video-frame">
     <video ref={video} className="mango-film" muted playsInline preload="auto" poster="/vid/hero-start.webp" aria-label="Fruzo Mango. Scroll down to advance the film, or up to reverse it." disablePictureInPicture/>
     <div className="hero-static" role="img" aria-label="Fruzo Mango bottle from the supplied film"/>
     <div className="video-progress" aria-hidden="true"><span/></div>
    </div>
    <div className="video-bottom"><span className="video-scroll-label">SCROLL TO DISCOVER</span><button type="button" onClick={()=>setSimple(!simple)} aria-pressed={simple}>{simple?'Enable scroll animation':'Still image'}</button></div>
   </div>
  </div>
 </section>;
}
