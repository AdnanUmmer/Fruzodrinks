import { jsonLd } from '@/lib/origin.mjs';
export function StructuredData({data}:{data:unknown}) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(data)}}/>;
}
