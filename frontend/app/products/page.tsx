import { Suspense } from 'react';
import Loading from '@/components/Loading';
import { pageMetadata, breadcrumbs } from '@/lib/seo';
import { StructuredData } from '@/components/StructuredData';
import Link from 'next/link';
import { getProducts, getSite } from '@/lib/api';
import { ProductImage } from '@/components/ProductImage';
import { Footer } from '@/components/Footer';
import type { CSSProperties } from 'react';

export const metadata=pageMetadata('Our flavours','Explore the complete Fruzo flavour collection. Small Bottle. Big Happiness.','/products');
export default function ProductsPage() {return <Suspense fallback={<Loading/>}><ProductsContent/></Suspense>;}
async function ProductsContent() {
  const [products,site]=await Promise.all([getProducts(),getSite()]);
  return <main id="main"><section className="catalogue-page">
    <div className="catalogue-heading"><span className="eyebrow">THE COMPLETE FRUZO COLLECTION</span><h1>PICK YOUR<br /><em>HAPPINESS.</em></h1><p>{products.length} flavours. Small Bottle. Big Happiness.</p></div>
    <StructuredData data={breadcrumbs([{name:"Home",path:"/"},{name:"Our flavours",path:"/products"}])}/><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-current="page">Our flavours</span></nav>{!products.length && <p className="empty-message">Our collection will be here soon. <Link href="/contact">Contact Fruzo</Link></p>}<div className="product-grid">{products.map((product,index)=><Link href={`/products/${product.slug}`} key={product.slug} className="product-tile"
      style={{'--world':product.primary_color,'--ink':product.text_color} as CSSProperties}>
      <div className="tile-top"><span>{String(index+1).padStart(2,'0')}</span><span>{product.volume_ml} ML</span></div>
      <h2>{product.flavor}</h2><ProductImage product={product} priority={index<2}/>
      <div className="tile-bottom"><span>Explore flavour</span><span aria-hidden="true">↗</span></div>
    </Link>)}</div>
  </section><Footer site={site}/></main>;
}
