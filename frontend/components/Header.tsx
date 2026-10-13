'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useState,useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
const links=[['Home','/'],['About Us','/about'],['Our Flavours','/products'],['Distributor Enquiry','/distributor'],['FAQs','/faq'],['Contact Us','/contact']];
export function Header(){
 const [open,setOpen]=useState(false);const menu=useRef<HTMLButtonElement>(null);const pathname=usePathname();
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);menu.current?.focus()}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[]);
 return <header className={`site-header evolution-header${open?' menu-open':''}`}>
 <Link href="/" aria-label="Fruzo home" className="brand-logo" onClick={()=>setOpen(false)}><Image src="/images/logo.webp" alt="Fruzo" width={150} height={88} preload/></Link>
 <nav id="main-navigation" aria-label="Main navigation">{links.map(([label,href])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}</nav>
 <button ref={menu} className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open?'Close navigation':'Open navigation'} onClick={()=>setOpen(!open)}><span/><span/></button>
 </header>
}
