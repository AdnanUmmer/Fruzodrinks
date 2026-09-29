import Link from 'next/link';
import { ProductImage } from './ProductImage';
import type { Product } from '@/types/catalogue';

export function Collection({products}: {products:Product[]}) {
  return <section className="collection" id="collection" aria-labelledby="collection-title">
    <div className="section-overline"><span className="eyebrow">A FLAVOUR FOR YOUR MOMENT</span><span className="eyebrow">THE COMPLETE COLLECTION</span></div>
    <h2 id="collection-title">FIND YOUR<br /><em>HAPPY.</em></h2>
    <div className="bottle-lineup">{products.map((product,index)=><Link href={`/products/${product.slug}`} key={product.slug}
      style={{'--lean':`${(index%3-1)*7}deg`,'--lift':`${(index%2)*24}px`} as React.CSSProperties} aria-label={`Explore ${product.flavor}`}>
      <ProductImage product={product} decorative /><span>{product.flavor}</span>
    </Link>)}</div>
    <Link href="/products" className="pill-button">Meet all {products.length} flavours <span aria-hidden="true">↗</span></Link>
  </section>;
}
