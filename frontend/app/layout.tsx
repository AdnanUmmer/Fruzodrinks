import type { Metadata } from 'next';
import '@fontsource/anton/latin-400.css';
import '@fontsource-variable/dm-sans/standard.css';
import './globals.css';
import './evolution.css';
import { Header } from '@/components/Header';
import { SITE_ORIGIN } from '@/lib/api';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {default:'Fruzo — Refreshing Every Moment', template:'%s | Fruzo'},
  description: 'Discover the Fruzo flavour collection. Small Bottle. Big Happiness. From Almas Refreshment and Beverages, Kerala.',
  openGraph: {title:'Fruzo — Refreshing Every Moment', description:'Small Bottle. Big Happiness.', type:'website'},
  icons: {icon:'/icon.svg'},
  verification: {google:process.env.GOOGLE_SITE_VERIFICATION, other:process.env.BING_SITE_VERIFICATION ? {'msvalidate.01':process.env.BING_SITE_VERIFICATION} : {}},
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header />{children}</body></html>;
}

