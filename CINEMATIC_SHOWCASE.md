# Cinematic showcase and conceptual delivery finale

The existing homepage, catalogue, product routes and backend are retained. The travelling Mango hands off at the flavour showcase; the packing section uses a frozen snapshot of its selected flavour.

## Source artwork

Original inputs remain in `img/` and the parent `Fruzodrinks.pdf`. `scripts/prepare-showcase-assets.cjs` creates normalized bottle crops and ingredient cutouts in `frontend/public/cinematic/source/`; crop measurements are recorded in `source/showcase/asset-manifest.json`. Mango uses the front view of `mango_3D.png`. Its unverified rear, 250 ml text, nutrition, ingredients and barcode are not used. Unconfirmed fine print at the extreme front edge is also withheld, using the adjacent original colour strip while retaining the logo and flavour graphics. All site capacity information remains 200 ml.

Authentic photographic detail is projected onto curved bottle and independently moving cap geometry. Side geometry and the logo/slogan rear artwork are provisional because official wraparound artwork is unavailable. Source-obscured areas cannot be asserted to be exact. The rear texture visibly identifies itself as provisional. Cardboard packaging is conceptual and carries no shipping, quantity or certification claims.

## Scene ownership

- `HomeExperience.tsx`: existing sections, accessible selection/pause controls and delivery markup.
- `createHomeExperience.ts`: responsive journey, wheel moderation, selection/drag, eight-second autoplay and reversible delivery progress.
- `createCinematic.ts`: one shared WebGL renderer; active/outgoing bottle transforms, independently controlled cap, fluid/ingredient treatment and delivery snapshot.
- `mangoBottle.ts`: reusable real 3D body, authentic front detail and provisional rear.
- `createJuiceFlow.ts`: variable-width ballistic stream, tapered sheet and separated droplets; no mouth dome.
- `createDeliveryBox.ts`: thick walls, floor, independent hinged flaps, grain and authentic printed logo.
- `cinematicConfig.ts`: hero/journey distances, scrub, wheel limiter, reveal and autoplay timings, rendering resolution and delivery duration.

Autoplay pauses on focused controls, dragging, off-screen visibility, hidden tabs and delivery ownership. Manual selection restarts its timer. Pause/play is explicit. Reduced motion starts paused and uses static products/packing artwork. WebGL loss restores the original image fallback. Mobile packing is constrained to its reserved stage to avoid covering copy.

## Local preview and verification

From `fruzo`, start the unchanged local backend with `.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8017 --noreload`. From `frontend`, use `npm run dev`, or `npm run build` followed by `npm start`. No email tests or deployments are involved.

From `fruzo`, browser checks use the available bundled Playwright runtime:

- `node scripts/verify-showcase-delivery.cjs`: ten reveals, persistent liquid, rapid selections, snapshot locking, reverse packing, comparisons, mobile and reduced motion.
- `node scripts/verify-showcase-controls.cjs`: autoplay, pause/focus safety, keyboard/drag, existing routes and WebGL fallback.
- `node scripts/verify-showcase-scroll.cjs`: large/regular wheel input, full turn, reversing, keyboard/anchors and 3D fall.
- `node scripts/capture-showcase-delivery.cjs`: browser recording and major-stage screenshots.

Artifacts are in `qa/showcase-delivery/`. The recording is generated locally using browser MediaRecorder and a CDP screencast, without additional packages. It shows choreographed animation rather than a fluid simulation. Native scroll devices retain different physical input speeds; scrub and the optional hero-only limiter smooth abrupt input without trapping navigation. Disable the limiter with `?wheelLimiter=off` or the central configuration.
