export interface FlavorAsset {
  image: string;
  alt_text: string;
  role: 'foreground' | 'background';
  display_order: number;
}
export interface Product {
  name: string;
  slug: string;
  flavor: string;
  short_description: string;
  description: string;
  image: string;
  assets: FlavorAsset[];
  decoration_asset: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  volume_ml: number;
  carton_units: number;
  ingredients: string;
  nutrition: string;
  display_order: number;
  catalogue_page: number | null;
  updated_at: string;
}
export interface SiteContent {
  brand_name: string;
  tagline: string;
  headline: string;
  company_name: string;
  address: string;
  email: string;
  website: string;
  story: string;
}
