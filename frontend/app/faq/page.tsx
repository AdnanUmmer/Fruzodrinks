import Link from 'next/link';
import { getFAQs, getSite } from '@/lib/api';
import { pageMetadata, breadcrumbs } from '@/lib/seo';
import { StructuredData } from '@/components/StructuredData';
import { Footer } from '@/components/Footer';
export const metadata=pageMetadata('Frequently asked questions','Answers to your questions about Fruzo drinks and our flavour collection.','/faq');
export default async function FAQPage() {
  const [faqs,site]=await Promise.all([getFAQs(),getSite()]);
  return <main id="main"><section className="editorial-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-current="page">FAQs</span></nav><span className="eyebrow">A LITTLE MORE FRUZO</span><h1>GOOD QUESTIONS.<br/><em>FRESH ANSWERS.</em></h1>
    <StructuredData data={breadcrumbs([{name:'Home',path:'/'},{name:'FAQs',path:'/faq'}])}/>
    {faqs.length ? <><div className="faq-list">{faqs.map(faq=><details key={faq.id}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div><StructuredData data={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(faq=>({'@type':'Question',name:faq.question,acceptedAnswer:{'@type':'Answer',text:faq.answer}}))}}/></> : <p className="empty-message">Have a question about Fruzo? Our team can help.</p>}
    <Link href="/contact" className="pill-button">Ask us a question </Link></section><Footer site={site}/></main>;
}
