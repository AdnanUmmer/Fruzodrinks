import Link from 'next/link';
export default function NotFound() {
  return <main id="main" className="error-page"><span className="eyebrow">404</span><h1>A different flavour?</h1><p>This page isn’t in our collection.</p><Link className="pill-button" href="/products">Explore all flavours</Link></main>;
}
