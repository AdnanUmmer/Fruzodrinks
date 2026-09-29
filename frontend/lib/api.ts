import 'server-only';
import { cache } from 'react';
import type { Product, SiteContent } from '@/types/catalogue';

const API = process.env.API_ORIGIN || 'http://127.0.0.1:8000';
export const SITE_ORIGIN = process.env.SITE_ORIGIN || 'http://localhost:3000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API}/api/${path}/`, {
    cache: 'no-store', signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Catalogue request failed (${response.status}).`);
  return response.json() as Promise<T>;
}
export const getProducts = cache(() => request<Product[]>('products'));
export const getSite = cache(() => request<SiteContent>('site'));
export const getProduct = cache(async (slug: string) => {
  const response = await fetch(`${API}/api/products/${encodeURIComponent(slug)}/`, {
    cache: 'no-store', signal: AbortSignal.timeout(8000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('The flavour catalogue is temporarily unavailable.');
  return response.json() as Promise<Product>;
});
