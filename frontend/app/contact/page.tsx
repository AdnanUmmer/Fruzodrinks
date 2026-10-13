import Link from 'next/link';
import { getProducts, getSite } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { EnquiryForm } from '@/components/EnquiryForm';
import { Footer } from '@/components/Footer';
export const metadata=pageMetadata('Contact Fruzo','Get in touch with Fruzo for product information, distribution and general enquiries.','/contact');
export default async function ContactPage({searchParams}:{searchParams:Promise<{product?:string}>}) {
  const [products,site,query]=await Promise.all([getProducts(),getSite(),searchParams]);
  return <main id="main"><section className="editorial-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-current="page">Contact</span></nav><span className="eyebrow">LET’S TALK FRUZO</span><h1>{site.contact_heading}</h1><div className="contact-layout"><div className="contact-aside"><p>{site.contact_intro || 'For product information, distribution or a question about Fruzo, send us an enquiry.'}</p><strong>{site.company_name}</strong><p>{site.address}</p>{site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}{site.phone && <a href={`tel:${site.phone.replace(/[^+0-9]/g,'')}`}>{site.phone}</a>}</div><EnquiryForm products={products.map(p=>({slug:p.slug,name:p.name}))}selectedProduct={query.product}/></div></section><Footer site={site}/></main>;
}
