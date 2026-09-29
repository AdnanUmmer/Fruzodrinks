import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return <header className="site-header">
    <Link href="/" aria-label="Fruzo home" className="brand-logo">
      <Image src="/images/logo.webp" alt="Fruzo" width={150} height={88} preload />
    </Link>
    <nav aria-label="Main navigation">
      <Link href="/products">Our flavours</Link>
      <Link href="/#our-world" className="story-nav">Our world</Link>
    </nav>
    <Link href="/#contact" className="header-contact">Say hello <span aria-hidden="true">↗</span></Link>
  </header>;
}
