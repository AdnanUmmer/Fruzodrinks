'use client';
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ProductImage} from '@/components/ProductImage';
import {Chevron} from '@/components/Chevron';
import type {Product,SiteContent} from '@/types/catalogue';
import type {CSSProperties} from 'react';
export function HomeExperience({products,site}:{products:Product[];site:SiteContent}){
 const root=useRef<HTMLDivElement>(null);const choose=useRef<(index:number)=>void>(()=>{});const [active,setActive]=useState(0);const [simple,setSimple]=useState(false);
 useEffect(()=>{let disposed=false;let cleanup:(()=>void)|undefined;import('./createHomeExperience').then(({createHomeExperience})=>{if(disposed||!root.current)return;const controls=createHomeExperience(root.current,products,simple,setActive);choose.current=controls.choose;cleanup=controls.dispose});return()=>{disposed=true;cleanup?.();choose.current=()=>{}}},[products,simple]);
 const product=products[active]||products[0];if(!product)return null;
 const headline=site.headline.split(/(?<=[.!?])\s+/);
 const anchor=(name:string)=> <div className={`journey-anchor ${name}-anchor`} data-stop={name} aria-hidden="true"><ProductImage product={products[0]} decorative className="journey-fallback"/></div>;
 return <div ref={root} className="home-journey" id="experience" style={{'--featured-color':products[0].primary_color} as CSSProperties}>
 <div className="travelling-bottle" aria-hidden="true"><div className="travelling-depth"><ProductImage product={products[0]} priority decorative/></div></div>
 <div className="cinematic-chapter"><section className="evolution-hero" style={{backgroundColor:products[0].primary_color}}>
 <div className="evolution-overline"><span>{site.tagline}</span><span>FRUZO / {products.length} FLAVOURS</span></div>
 <h1 className="evolution-title">{headline[0]}<br/><em>{headline.slice(1).join(' ')}</em></h1>
 {anchor('hero')}
 <div className="evolution-hero-note"><span className="hero-asterisk" aria-hidden="true">✳</span><p>A little bottle.<br/>A whole world<br/>of flavours.</p></div>
 <a className="hero-explore" href="#collection"><span>Find your<br/>Fruzo moment.</span><Chevron direction="down"/></a>
 <div className="cinematic-caption" aria-hidden="true"><span className="cinematic-kicker">THE MANGO MOMENT</span><span className="cinematic-line">A LITTLE GOLDEN ESCAPE.</span><div className="cinematic-track"><i/></div></div>
 <div className="hero-ring" aria-hidden="true"/>
 {products[0].decoration_asset&&<Image className="hero-fruit" src={products[0].decoration_asset} alt="" width={269} height={158} sizes="(max-width:799px) 70px,150px"/>}
 <Image className="hero-leaf" src="/images/leaf.webp" alt="" width={151} height={112} sizes="(max-width:799px) 60px,110px"/>
 <div className="evolution-bottom"><a href="#our-world">SCROLL INTO OUR WORLD <Chevron direction="down"/></a><span>{product.flavor.toUpperCase()} / {product.volume_ml} ML</span></div>
 <button className="motion-switch" onClick={()=>setSimple(!simple)} aria-pressed={simple}>{simple?'Enable motion':'Less motion'}</button>
 </section></div>
 <section className="journey-story journey-section" id="our-world">
 <div className="journey-art">{anchor('story')}<div className="story-orbit" aria-hidden="true"/><span className="art-caption">ONE BOTTLE.<br/>A WORLD OF MOMENTS.</span></div>
 <div className="journey-copy"><span className="eyebrow">WELCOME TO OUR WORLD</span><h2>REFRESHING<br/><em>EVERY MOMENT.</em></h2><p>{site.story}</p><p>From your familiar favourite to something different. There’s a Fruzo flavour for your next little break.</p><Link className="text-link" href="/about">About Fruzo <Chevron/></Link></div>
 </section>
 <section className="journey-highlights journey-section">
 <div className="journey-copy"><span className="eyebrow">THE FRUZO COLLECTION</span><h2>A LITTLE<br/>BOTTLE.<br/><em>A LOT TO EXPLORE.</em></h2><div className="journey-facts"><div><strong>{String(products.length).padStart(2,'0')}</strong><span>flavours</span></div><div><strong>{product.volume_ml}<small>ML</small></strong><span>per bottle</span></div><div><strong>{product.carton_units}</strong><span>pieces per carton</span></div></div><p>Lemon Salt, Cola, Mango, Nannari and more. Explore the full collection and find your favourite.</p></div>
 <div className="journey-art">{anchor('highlights')}<span className="highlight-word" aria-hidden="true">FRUZO</span></div>
 </section>
 <section className="flavour-carousel" id="collection" aria-labelledby="flavour-carousel-title" style={{'--carousel-ink':product.text_color,'--carousel-world':product.primary_color,backgroundColor:product.primary_color,color:product.text_color} as CSSProperties}>
 <div className="carousel-heading"><div><span className="eyebrow">A FLAVOUR FOR YOUR MOMENT</span><h2 id="flavour-carousel-title">FIND YOUR <em>HAPPY.</em></h2></div><Link href="/products" className="view-all-flavours">View All Flavours <Chevron/></Link></div>
 <div className="carousel-stage" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Fruzo flavours. Use left and right arrow keys." onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();choose.current(active+(e.key==='ArrowRight'?1:-1))}if(e.key==='Home'||e.key==='End'){e.preventDefault();choose.current(e.key==='Home'?0:products.length-1)}}}>
 <span className="carousel-world-title" aria-hidden="true">{product.flavor}</span>
 <div className="carousel-rail">{products.map((p,i)=><Link key={p.slug} href={`/products/${p.slug}`} className="carousel-bottle" data-index={i} data-active={active===i} aria-label={active===i?`View ${p.flavor}`:`Select ${p.flavor}`} tabIndex={active===i?0:-1} onClick={e=>{if(root.current?.dataset.dragged==='true'){e.preventDefault();return}if(active!==i){e.preventDefault();choose.current(i)}}}><ProductImage product={p} decorative/><span>{p.flavor}</span></Link>)}</div>
 <div className="journey-anchor carousel-anchor" data-stop="carousel" aria-hidden="true"/>
 <button className="carousel-chevron previous-flavour" aria-label="Previous flavour" onClick={()=>choose.current(active-1)}><Chevron direction="left"/></button><button className="carousel-chevron next-flavour" aria-label="Next flavour" onClick={()=>choose.current(active+1)}><Chevron/></button>
 </div>
 <div className="carousel-details"><div className="carousel-description"><span className="eyebrow"><span>{String(active+1).padStart(2,'0')}</span> / {String(products.length).padStart(2,'0')} — THE FRUZO COLLECTION</span><h3 aria-live="polite" aria-atomic="true">{product.flavor}</h3><p>{product.volume_ml} ml bottle · {product.carton_units} pieces per carton</p></div><div className="carousel-actions"><Link className="pill-button" href={`/products/${product.slug}`}>View Product <Chevron/></Link><Link className="text-link" href={`/contact?product=${product.slug}`}>Enquire Now <Chevron/></Link></div></div>
 <div className="carousel-picker"><label htmlFor="direct-flavour">YOUR FLAVOUR</label><select id="direct-flavour" value={active} onChange={e=>choose.current(Number(e.target.value))}>{products.map((p,i)=><option value={i} key={p.slug}>{p.flavor}</option>)}</select><span className="carousel-hint">Drag to discover. Find your favourite.</span><div className="carousel-progress" aria-hidden="true">{products.map((p,i)=><span key={p.slug} className={active===i?'selected':''}/>)}</div></div>
 </section>
 </div>
}
