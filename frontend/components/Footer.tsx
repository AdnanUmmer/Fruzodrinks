import Link from 'next/link';
import Image from 'next/image';
import type {SiteContent} from '@/types/catalogue';
export function Footer({site}:{site:SiteContent}){
 return <footer id="contact" className="site-footer submission-footer">
  <div className="footer-invitation"><div><span className="eyebrow">LET’S TALK FRUZO</span><h2>{site.contact_heading}</h2></div><Link href="/contact" className="footer-enquire">Send an enquiry</Link></div>
  <div className="footer-grid">
   <div className="footer-brand-block"><Link href="/" aria-label="Fruzo home"><Image src="/images/fruzo-logo.webp" alt="Fruzo — Refreshing Every Moment" width={180} height={110}/></Link><p>{site.tagline}</p></div>
   <div className="footer-company"><h3>{site.company_name}</h3><address>{site.address}</address>{site.email&&<a href={`mailto:${site.email}`}>{site.email}</a>}{site.phone&&<a href={`tel:${site.phone.replace(/[^+0-9]/g,'')}`}>{site.phone}</a>}</div>
   <nav className="footer-links" aria-label="Footer navigation"><h3>Explore Fruzo</h3><Link href="/products">Our flavours</Link><Link href="/about">About us</Link><Link href="/distributor">Distributor enquiry</Link><Link href="/faq">FAQs</Link><Link href="/contact">Contact us</Link></nav>
   <div className="footer-connect"><h3>Stay connected</h3>{site.instagram_url&&<a href={site.instagram_url} rel="noopener noreferrer">Instagram</a>}{site.facebook_url&&<a href={site.facebook_url} rel="noopener noreferrer">Facebook</a>}<Link href="/contact">Start a conversation</Link><a href="#main">Back to top</a></div>
  </div>
  <div className="footer-legal"><span>© {new Date().getFullYear()} {site.company_name}</span><Link href="/privacy">Privacy policy</Link></div>
  {site.footer_note&&<p className="footer-note">{site.footer_note}</p>}
 </footer>;
}
