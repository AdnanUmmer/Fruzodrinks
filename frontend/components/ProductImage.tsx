'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/types/catalogue';

export function ProductImage({product, priority=false, className='', decorative=false, width=540, height=800}: {
  product: Product; priority?: boolean; className?: string; decorative?: boolean; width?: number; height?: number;
}) {
  const [failed,setFailed]=useState(false);
  if (!product.image || failed) return <span className="image-unavailable">{product.name}</span>;
  return <Image src={product.image} onError={()=>setFailed(true)} alt={decorative ? '' : product.image_alt || `${product.name}, ${product.volume_ml} ml bottle`}
    width={width} height={height} className={`product-image ${className}`}
    sizes="(max-width: 600px) 65vw, (max-width: 1000px) 42vw, 460px"
    fetchPriority={priority ? 'high' : undefined}
    loading={priority || decorative ? 'eager' : 'lazy'} draggable={false}
    unoptimized={product.image.startsWith('/media/')} />;
}
