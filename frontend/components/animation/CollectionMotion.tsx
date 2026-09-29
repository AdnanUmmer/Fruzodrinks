'use client';
import { useEffect,useRef } from 'react';

export function CollectionMotion({children}:{children:React.ReactNode}) {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let dispose:(()=>void)|undefined, cancelled=false;
    const initialize=async()=>{
      dispose?.();
      const [{default:gsap},{ScrollTrigger}]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger')]);
      if(cancelled||!root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const media=gsap.matchMedia(root.current);
      media.add('(prefers-reduced-motion: no-preference)',()=>{
        if(document.documentElement.dataset.motion==='reduced') return;
        const bottles=Array.from(root.current!.querySelectorAll<HTMLElement>('.bottle-lineup a'));
        const timeline=gsap.timeline({scrollTrigger:{trigger:root.current,start:'top 88%',end:'center 60%',scrub:true}});
        bottles.forEach((bottle,i)=>{
          timeline.from(bottle,{x:()=>((bottles.length-1)/2-i)*40,y:120+Math.abs(i-bottles.length/2)*12,rotation:(i-bottles.length/2)*5,scale:.72,ease:'none'},0);
        });
      });
      dispose=()=>media.revert();
    };
    void initialize();
    window.addEventListener('fruzo-motion',initialize);
    return ()=>{cancelled=true;dispose?.();window.removeEventListener('fruzo-motion',initialize);};
  },[]);
  return <div ref={root}>{children}</div>;
}
