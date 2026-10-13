import {getSite} from '@/lib/api';
import {pageMetadata} from '@/lib/seo';
import {Footer} from '@/components/Footer';
import {DistributorPreview} from '@/components/DistributorPreview';
export const metadata=pageMetadata('Distributor enquiry','Start a business conversation with Fruzo.','/distributor');
export default async function Distributor(){const site=await getSite();return <main id="main"><section className="editorial-page distributor-preview"><span className="eyebrow">LET’S BRING FRUZO FURTHER</span><h1>A NEW<br/><em>CONVERSATION.</em></h1><div className="contact-layout"><div className="contact-aside"><p>Interested in distributing Fruzo or bringing our flavours to your business? Tell us where you’re based and how to reach you.</p><strong>{site.company_name}</strong><p>{site.address}</p><a href={`mailto:${site.email}`}>{site.email}</a></div><div><DistributorPreview/></div></div></section><Footer site={site}/></main>}
