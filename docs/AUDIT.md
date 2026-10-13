# Baseline audit — 1 October 2026

Inspected Next app routes, all components/GSAP styles, data helpers, images, Django models/serializers/views/admin/settings/validators, migrations, seed command and tests. Existing approved catalogue and animation architecture retained.

Baseline: frontend lint/typecheck/build passed; Django system/migration checks passed. 12 of 13 Django tests passed; admin upload/edit/delete encountered a Windows file-handle cleanup error. Closing normalized product image fields after saving fixed it; original tests retained.

Findings addressed: invalid multi-URL SITE_ORIGIN; absent FAQs/enquiries; minimal admin; hardcoded contact headings and SEO; missing social metadata and schema; no production media/deployment/backup guide; missing image and loading states; tiny mobile flavour controls; narrow product cards; dark header on Cola; keyboard flavour selection based on stale active state; animation refresh could reset active-scene accessibility; collection animation async initialization race. A root streaming loading boundary introduced during implementation returned HTTP 200 on unknown products; scoped loading boundaries fixed it.

No checkout, reviews, certifications, analytics or new product claims added. Source artwork is retained; perfect studio cutouts require better approved source assets. Dynamic API fetches intentionally remain uncached across requests so publishing/unpublishing takes effect immediately; React cache deduplicates within a request. Consider measured caching only with an invalidation strategy.
