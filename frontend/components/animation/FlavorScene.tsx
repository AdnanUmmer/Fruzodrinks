import Link from 'next/link';
import Image from 'next/image';
import { ProductImage } from '@/components/ProductImage';
import type { Product } from '@/types/catalogue';
import type { CSSProperties } from 'react';

export function FlavorScene({product, index}: {product: Product; index: number}) {
  const style = {'--world':product.primary_color, '--glow':product.secondary_color,
    '--ink':product.text_color, '--accent':product.accent_color} as CSSProperties;
  return <article className={`flavor-scene flavor-${product.slug}`} style={style}
    id={`flavor-${product.slug}`} aria-label={product.name} data-flavor={product.slug}>
    <div className="world-wash" aria-hidden="true" />
    <div className="world-topline"><span className="eyebrow">THE FRUZO COLLECTION</span><span className="eyebrow">{String(index+1).padStart(2,'0')} / {product.volume_ml} ML</span></div>
    <h2 className="world-title">{product.flavor}</h2>
    <div className="bottle-orbit">
      <div className="bottle-shadow" aria-hidden="true" />
      <div className="bottle-tilt">
        {index === 0 && <div className="bottle-ghost" aria-hidden="true"><ProductImage product={product} decorative /></div>}
        <div className="bottle-colour"><ProductImage product={product} priority={index===0} /></div>
      </div>
    </div>
    <div className="world-rim" aria-hidden="true" />
    {product.decoration_asset && <div className="scene-fruit" aria-hidden="true"><Image src={product.decoration_asset} alt="" width={260} height={220} sizes="(max-width:800px) 70px, 130px" loading="lazy"/></div>}
    {product.assets.map((asset,i)=><div key={`${asset.image}-${i}`} className={`flavor-asset asset-${asset.role}`}>
      <Image src={asset.image} alt={asset.alt_text} width={220} height={220} sizes="180px" unoptimized={asset.image.startsWith('/media/')} />
    </div>)}
    <div className="product-copy"><span className="eyebrow">{product.short_description}</span>
      <p>{product.description}</p>
      <Link className="text-link" href={`/products/${product.slug}`}>Explore {product.flavor}<span aria-hidden="true">↗</span></Link>
    </div>
    <div className="size-note"><strong>{product.volume_ml}<small>ML</small></strong><span>{product.carton_units} bottles per carton</span></div>
  </article>;
}
