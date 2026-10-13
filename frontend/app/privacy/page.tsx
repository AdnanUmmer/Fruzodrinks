import Link from 'next/link';
import { getSite } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { Footer } from '@/components/Footer';
export const metadata=pageMetadata('Privacy notice','How to contact Fruzo about your enquiry and personal information.','/privacy');
export default async function PrivacyPage() {
  const site=await getSite();
  return <main id="main"><section className="editorial-page privacy-page"><Link className="text-link" href="/contact">← Contact Fruzo</Link><h1>Privacy notice</h1>{site.privacy_notice?<div className="prose">{site.privacy_notice}</div>:<div className="prose"><p>Enquiries are sent to {site.company_name}. We collect the details you enter so our team can handle your enquiry.</p><p>This website does not include advertising or analytics trackers. Staff administration uses essential session and security cookies.</p><p>For questions about your information, contact <a href={`mailto:${site.email}`}>{site.email}</a>.</p></div>}</section><Footer site={site}/></main>;
}
