'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FlavorScene } from './FlavorScene';
import type { Product, SiteContent } from '@/types/catalogue';

export function Experience({products, site}: {products: Product[]; site: SiteContent}) {
  const root = useRef<HTMLDivElement>(null);
  const navigate = useRef<(index:number)=>void>(()=>{});
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [simple, setSimple] = useState(false);
  const touch = useRef<{x:number; y:number}|null>(null);
  const activeRef = useRef(0);

  useEffect(()=>{
    document.documentElement.dataset.motion=simple?'reduced':'full';
    window.dispatchEvent(new Event('fruzo-motion'));
    return ()=>{delete document.documentElement.dataset.motion;};
  },[simple]);

  useEffect(()=>{
    let dispose: (()=>void)|undefined;
    let cancelled = false;
    if (!root.current || !products.length) return;
    import('./createExperience').then(({createExperience})=>{
      if (cancelled || !root.current) return;
      dispose = createExperience(root.current, products, simple, (i,p)=>{activeRef.current=i; setActive(i); setPhase(p);}, navigate, activeRef.current);
    }).catch(()=>{
      // All articles stay in normal document flow if enhancement cannot initialize.
      root.current?.removeAttribute('data-enhanced');
    });
    return ()=>{cancelled=true; dispose?.();};
  },[products,simple]);

  if (!products.length) return <section className="empty-catalogue"><h1>{site.headline}</h1><p>Our collection will be here soon.</p><Link className="pill-button" href="#contact">Contact Fruzo</Link></section>;

  function choose(index:number) {
    const target=Math.max(0,Math.min(index,products.length-1));
    navigate.current(target);
  }
  const headline=site.headline.split(/(?<=[.!?])\s+/);
  return <div ref={root} className="experience" id="experience">
    <h1 className="sr-only">{site.headline}</h1>
    <div className="experience-stage" onPointerDown={event=>{
      if (event.target instanceof Element && event.target.closest('a,button')) return;
      touch.current={x:event.clientX,y:event.clientY};
    }} onPointerUp={event=>{
      if (!touch.current) return;
      const dx=event.clientX-touch.current.x, dy=event.clientY-touch.current.y;
      touch.current=null;
      if (Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.4) choose(active+(dx<0?1:-1));
    }} onPointerCancel={()=>{touch.current=null;}}>
      {products.map((product,index)=><FlavorScene key={product.slug} product={product} index={index} />)}
      <section className="hero-overlay" aria-label={site.headline}>
        <div className="hero-overline"><span>{site.tagline.toUpperCase()}</span><span>{site.brand_name.toUpperCase()} / {products.length} FLAVOURS</span></div>
        <p id="hero-title" className="hero-headline" aria-hidden="true">{headline[0].toUpperCase()}<br /><span>{headline.slice(1).join(' ').toUpperCase()}</span></p>
        <div className="hero-note"><span className="tiny-star" aria-hidden="true">✳</span><p>A little bottle.<br />A whole world<br />of flavours.</p></div>
        <div className="hero-action"><p>{products[0].volume_ml} ml of<br />Fruzo happiness.</p><button className="circle-button" onClick={()=>choose(0)} aria-label="Explore the flavours"><span aria-hidden="true">↘</span></button></div>
        <div className="hero-bottom"><span>SCROLL TO FIND YOUR FLAVOUR <span aria-hidden="true">↓</span></span><span>{products[0].flavor.toUpperCase()} / {products[0].volume_ml} ML</span></div>
      </section>
      <div className="assembly-overlay" aria-hidden="true"><span className="eyebrow">REFRESHING EVERY MOMENT</span><p>A LITTLE<br /><em>HAPPINESS.</em></p><span className="assembly-caption">Meet {products[0].name}.</span></div>
      {products[0].decoration_asset && <div className="ingredient ingredient-one" aria-hidden="true"><Image src={products[0].decoration_asset} alt="" width={280} height={170} sizes="180px" /></div>}
      <div className="ingredient ingredient-two" aria-hidden="true"><Image src="/images/leaf.webp" alt="" width={170} height={125} sizes="110px" /></div>
      <nav className="flavor-controls" aria-label="Choose a flavour" onKeyDown={event=>{
        if(!(event.target instanceof HTMLButtonElement) || !event.target.dataset.index) return;
        const index=Number(event.target.dataset.index);
        const next=event.key==='ArrowRight'?index+1:event.key==='ArrowLeft'?index-1:event.key==='Home'?0:event.key==='End'?products.length-1:null;
        if(next===null)return;
        event.preventDefault();
        const target=Math.max(0,Math.min(next,products.length-1));
        event.currentTarget.querySelector<HTMLButtonElement>(`button[data-index="${target}"]`)?.focus({preventScroll:true});
        choose(target);
      }}>
        <div className="explorer-count"><span>{String(active+1).padStart(2,'0')}</span><span className="count-rule"/><span>{String(products.length).padStart(2,'0')}</span></div>
        <label className="mobile-flavor-select"><span className="sr-only">Choose a flavour</span><select value={active} onChange={event=>choose(Number(event.target.value))}>{products.map((product,index)=><option key={product.slug} value={index}>{product.flavor}</option>)}</select></label>
        <div className="flavor-dots">{products.map((product,index)=><button key={product.slug}
          data-index={index} aria-label={`Show ${product.flavor}`} aria-current={active===index?'true':undefined}
          title={product.flavor} onClick={()=>choose(index)}><span style={{backgroundColor:product.primary_color}}/><span className="dot-name">{product.flavor}</span></button>)}</div>
        <Link href="/products" className="all-flavours-link">View all <span aria-hidden="true">↗</span></Link>
      </nav>
      <div className="experience-utilities"><button onClick={()=>setSimple(!simple)} aria-pressed={simple}>{simple?'Enable motion':'Less motion'}</button><a href="#collection">Skip to collection ↓</a></div>
      <span className="sr-only" aria-live="polite">{phase==='explore'?`${products[active].name}, ${active+1} of ${products.length}`:''}</span>
    </div>
  </div>;
}
