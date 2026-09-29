import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getProducts, getSite, SITE_ORIGIN } from '@/lib/api';
import { ProductImage } from '@/components/ProductImage';
import { Footer } from '@/components/Footer';

type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const product=await getProduct((await params).slug);
  if(!product) return {title:'Flavour not found',robots:{index:false}};
  return {title:product.flavor,description:product.description,
    alternates:{canonical:`/products/${product.slug}`},
    openGraph:{title:product.name,description:product.description,url:`/products/${product.slug}`,type:'website'},
  };
}
export default async function ProductPage({params}:Props) {
  const product=await getProduct((await params).slug);
  if(!product) notFound();
  const [products,site]=await Promise.all([getProducts(),getSite()]);
  const related=products.filter(p=>p.slug!==product.slug).slice(0,3);
  const jsonLd={'@context':'https://schema.org','@type':'Product',name:product.name,
    description:product.description,brand:{'@type':'Brand',name:site.brand_name},
    image:new URL(product.image,SITE_ORIGIN).href,
    url:`${SITE_ORIGIN}/products/${product.slug}`,
    size:`${product.volume_ml} ml`,additionalProperty:[{'@type':'PropertyValue',name:'Bottles per carton',value:product.carton_units}]};
  return <main id="main" className="detail-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/>
    <section className="product-detail" style={{'--world':product.primary_color,'--glow':product.secondary_color,'--ink':product.text_color} as CSSProperties}>
      <Link className="detail-back" href="/products">← All flavours</Link>
      <div className="detail-image"><div className="detail-halo"/><ProductImage product={product} priority/></div>
      <div className="detail-copy"><span className="eyebrow">REFRESHING EVERY MOMENT</span><h1>{product.flavor}</h1>
        <p>{product.description}</p>
        <dl className="product-facts"><div><dt>Bottle size</dt><dd>{product.volume_ml} <span>ml</span></dd></div><div><dt>Per carton</dt><dd>{product.carton_units} <span>bottles</span></dd></div></dl>
        {site.email && <a className="pill-button" href={`mailto:${site.email}?subject=${encodeURIComponent(`Enquiry about ${product.name}`)}`}>Enquire about {product.flavor} <span aria-hidden="true">↗</span></a>}
        {product.ingredients && <details className="product-info"><summary>Ingredients</summary><p>{product.ingredients}</p></details>}
        {product.nutrition && <details className="product-info"><summary>Nutrition information</summary><p>{product.nutrition}</p></details>}
      </div>
    </section>
    {product.catalogue_page && <section className="catalogue-feature"><div><span className="eyebrow">THE FRUZO CATALOGUE</span><h2>SMALL BOTTLE.<br />BIG HAPPINESS.</h2><p>{product.name}, as featured in our collection.</p><Link className="text-link" href="/products">Discover the range <span aria-hidden="true">↗</span></Link></div><Image src={`/images/catalogue-${product.catalogue_page}.webp`} alt={`Fruzo catalogue featuring ${product.flavor}`} width={683} height={1024} sizes="(max-width:800px) 85vw, 420px"/></section>}
    <section className="related-products"><span className="eyebrow">KEEP EXPLORING</span><h2>YOUR NEXT FLAVOUR.</h2><div className="product-grid">{related.map(p=><Link key={p.slug} href={`/products/${p.slug}`} className="product-tile" style={{'--world':p.primary_color,'--ink':p.text_color} as CSSProperties}><h3>{p.flavor}</h3><ProductImage product={p}/><div className="tile-bottom"><span>Explore flavour</span><span aria-hidden="true">↗</span></div></Link>)}</div></section>
    <Footer site={site}/>
  </main>;
}
