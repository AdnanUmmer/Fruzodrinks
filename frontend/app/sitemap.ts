import type { MetadataRoute } from 'next';
import { getProducts, SITE_ORIGIN } from '@/lib/api';
export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  const products=await getProducts();
  return [{url:SITE_ORIGIN,priority:1},{url:`${SITE_ORIGIN}/products`,priority:.9},
    ...products.map(p=>({url:`${SITE_ORIGIN}/products/${p.slug}`,lastModified:p.updated_at,priority:.8}))];
}
