import type { Metadata } from 'next';
import { SITE_ORIGIN } from './api';
export function pageMetadata(title:string, description:string, path:string, image='/images/logo.webp'):Metadata {
  return {title, description, alternates:{canonical:path},
    openGraph:{title, description, url:path, type:'website', siteName:'Fruzo', images:[{url:image,alt:title}]},
    twitter:{card:'summary_large_image',title,description,images:[image]}};
}
export function breadcrumbs(items:{name:string;path:string}[]) {
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:new URL(item.path,SITE_ORIGIN).href}))};
}
