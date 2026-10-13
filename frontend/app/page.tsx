import Link from 'next/link';
import {StructuredData} from '@/components/StructuredData';
import {pageMetadata} from '@/lib/seo';
import {getProducts,getSite,getFAQs,SITE_ORIGIN} from '@/lib/api';
import {HomeExperience} from '@/components/animation/HomeExperience';
import {Footer} from '@/components/Footer';
import {Chevron} from '@/components/Chevron';
export async function generateMetadata(){const site=await getSite();return pageMetadata(site.seo_title||`${site.brand_name} — ${site.tagline}`,site.seo_description||`${site.headline} Explore the Fruzo flavour collection from ${site.company_name}.`,'/')}
export default async function Home(){
 const [products,site,faqs]=await Promise.all([getProducts(),getSite(),getFAQs()]);
 const previewFaqs=faqs.length?faqs.slice(0,3):[{id:1,question:'What size are Fruzo bottles?',answer:'The Fruzo catalogue lists all ten flavours in 200 ml bottles.'},{id:2,question:'How many pieces are in a carton?',answer:'The catalogue lists 30 pieces per carton. Contact Fruzo for availability and business enquiries.'},{id:3,question:'How can I enquire about a flavour?',answer:'Choose a flavour and select Enquire Now. Your selected product will be included in the enquiry form.'}];
 return <main id="main"><StructuredData data={{'@context':'https://schema.org','@type':'Organization',name:site.company_name,url:SITE_ORIGIN,email:site.email}}/>
 <HomeExperience products={products} site={site}/>
 <section className="home-business" id="business"><div><span className="eyebrow">ALMAS REFRESHMENT AND BEVERAGES</span><h2>LET’S BRING<br/><em>FRUZO FURTHER.</em></h2></div><div className="business-copy"><span className="eyebrow">A CONVERSATION STARTS HERE</span><p>Interested in distributing Fruzo or bringing the collection to your business?</p><p>Tell us about your business and where you’re based. Connect with the team in Kottopadam, Mannarkkad, Kerala.</p><Link href="/distributor" className="pill-button">Distributor Enquiry <Chevron/></Link></div><span className="business-watermark" aria-hidden="true">FRUZO</span></section>
 <section className="home-faq"><div><span className="eyebrow">A LITTLE MORE FRUZO</span><h2>GOOD QUESTIONS.<br/><em>FRESH ANSWERS.</em></h2><Link href="/faq" className="text-link">All FAQs <Chevron/></Link></div><div className="faq-list">{previewFaqs.map(f=><details key={f.id}><summary>{f.question}<span aria-hidden="true">+</span></summary><p>{f.answer}</p></details>)}</div></section>
 <Footer site={site}/></main>
}
