import Link from 'next/link';
import type { SiteContent } from '@/types/catalogue';

export function Footer({site}: {site: SiteContent}) {
  return <footer id="contact" className="site-footer">
    <div className="footer-top"><span className="eyebrow">LET’S TALK FRUZO</span><span className="eyebrow">FROM KERALA, INDIA</span></div>
    <h2>Say hello.</h2>
    {site.email && <a className="contact-email" href={`mailto:${site.email}`}>{site.email} <span aria-hidden="true">↗</span></a>}
    <div className="footer-bottom">
      <div><strong>{site.company_name}</strong><p>{site.address}</p></div>
      <nav aria-label="Footer navigation"><Link href="/products">All flavours</Link><Link href="/#our-world">Our world</Link><a href="#main">Back to top ↑</a></nav>
      <span className="footer-tagline">{site.tagline}</span>
    </div>
  </footer>;
}
