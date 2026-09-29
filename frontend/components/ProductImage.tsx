import Image from 'next/image';
import type { Product } from '@/types/catalogue';

export function ProductImage({product, priority=false, className='', decorative=false}: {
  product: Product; priority?: boolean; className?: string; decorative?: boolean;
}) {
  if (!product.image) return <span className="image-unavailable">{product.name}</span>;
  return <Image src={product.image} alt={decorative ? '' : `${product.name}, ${product.volume_ml} ml bottle`}
    width={540} height={800} className={`product-image ${className}`}
    sizes="(max-width: 600px) 65vw, (max-width: 1000px) 42vw, 460px"
    preload={priority} loading={priority ? undefined : 'lazy'} draggable={false}
    unoptimized={product.image.startsWith('/media/')} />;
}
