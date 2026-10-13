import type { MetadataRoute } from 'next';
import { getProducts, getSite, getFAQs, SITE_ORIGIN } from '@/lib/api';
export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  const [products,site,faqs]=await Promise.all([getProducts(),getSite(),getFAQs()]);
  return [{url:SITE_ORIGIN,lastModified:site.updated_at,priority:1},{url:`${SITE_ORIGIN}/products`,priority:.9},
    {url:`${SITE_ORIGIN}/contact`,lastModified:site.updated_at},{url:`${SITE_ORIGIN}/privacy`,lastModified:site.updated_at},{url:`${SITE_ORIGIN}/faq`,...(faqs.length?{lastModified:faqs.map(f=>f.updated_at).sort().at(-1)}:{})},
    ...products.map(p=>({url:`${SITE_ORIGIN}/products/${p.slug}`,lastModified:p.updated_at,priority:.8}))];
}
