import Image from 'next/image';
import { getProducts, getSite } from '@/lib/api';
import { Experience } from '@/components/animation/Experience';
import { Collection } from '@/components/Collection';
import { CollectionMotion } from '@/components/animation/CollectionMotion';
import { Footer } from '@/components/Footer';

export const metadata = {alternates:{canonical:'/'}};
export default async function Home() {
  const [products,site]=await Promise.all([getProducts(),getSite()]);
  return <main id="main">
    <Experience products={products} site={site}/>
    <CollectionMotion><Collection products={products}/></CollectionMotion>
    <section className="brand-story" id="our-world">
      <div className="story-heading"><span className="eyebrow">WELCOME TO OUR WORLD</span><h2>REFRESHING<br /><em>EVERY MOMENT.</em></h2></div>
      <div className="story-copy"><span className="story-star" aria-hidden="true">✳</span><p>{site.story}</p><div className="story-facts"><div><strong>{String(products.length).padStart(2,'0')}</strong><span>flavours to explore</span></div><div><strong>200<small>ML</small></strong><span>small bottle, big happiness</span></div></div></div>
      <Image src="/images/fruit-story.webp" alt="Fruit composition from the Fruzo catalogue" width={1024} height={300} sizes="100vw" className="story-fruit"/>
    </section>
    <Footer site={site}/>
  </main>;
}
