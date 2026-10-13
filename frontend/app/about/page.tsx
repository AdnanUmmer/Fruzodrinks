import Image from 'next/image';
import Link from 'next/link';
import {getSite} from '@/lib/api';
import {pageMetadata} from '@/lib/seo';
import {Footer} from '@/components/Footer';
import {Chevron} from '@/components/Chevron';
export const metadata=pageMetadata('About Fruzo','Meet Fruzo from Almas Refreshment and Beverages, Kerala.','/about');
export default async function About(){const site=await getSite();return <main id="main"><section className="editorial-page about-original"><span className="eyebrow">WELCOME TO OUR WORLD</span><h1>SMALL BOTTLE.<br/><em>BIG HAPPINESS.</em></h1><div className="about-body"><div><p>{site.story}</p><p>{site.company_name}<br/>{site.address}</p><p>Explore ten Fruzo flavours in 200 ml bottles, from Lemon Salt and Cola to Mango and Nannari.</p><Link href="/products" className="pill-button">Explore our flavours <Chevron/></Link></div><Image src="/images/fruit-story.webp" alt="Fruit arrangement from the Fruzo catalogue" width={1024} height={300}/></div></section><section className="home-business"><div><span className="eyebrow">LET’S TALK FRUZO</span><h2>YOUR NEXT<br/><em>CONVERSATION.</em></h2></div><div className="business-copy"><p>For product questions and business enquiries, connect with the Fruzo team.</p><Link href="/contact" className="text-link">Contact us <Chevron/></Link></div></section><Footer site={site}/></main>}
