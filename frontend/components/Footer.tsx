import Link from 'next/link';
import {Chevron} from './Chevron';
import type {SiteContent} from '@/types/catalogue';
export function Footer({site}:{site:SiteContent}){
 return <footer id="contact" className="site-footer"><div className="footer-top"><span className="eyebrow">LET’S TALK FRUZO</span><span className="eyebrow">FROM KERALA, INDIA</span></div>
 <h2>{site.contact_heading}</h2><Link href="/contact" className="text-link footer-contact-link">Send an enquiry <Chevron/></Link>
 {site.email&&<a className="contact-email" href={`mailto:${site.email}`}>{site.email}<Chevron/></a>}
 <div className="footer-bottom"><div><strong>{site.company_name}</strong><p>{site.address}</p>{site.phone&&<p><a href={`tel:${site.phone.replace(/[^+0-9]/g,'')}`}>{site.phone}</a></p>}{site.instagram_url&&<p><a href={site.instagram_url} rel="noopener noreferrer">Instagram</a></p>}{site.facebook_url&&<p><a href={site.facebook_url} rel="noopener noreferrer">Facebook</a></p>}</div><nav aria-label="Footer navigation"><Link href="/products">All flavours</Link><Link href="/about">About us</Link><Link href="/distributor">Distributor enquiry</Link><Link href="/faq">FAQs</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><a href="#main">Back to top</a></nav><span className="footer-tagline">{site.tagline}</span></div>{site.footer_note&&<p className="footer-note">{site.footer_note}</p>}
 </footer>
}
