import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/lib/api';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots {
  return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin/']},sitemap:`${SITE_ORIGIN}/sitemap.xml`};
}
