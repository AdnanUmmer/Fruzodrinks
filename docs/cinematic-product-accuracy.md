# Fruzo product accuracy and cinematic preview

Preview: http://127.0.0.1:3000 (local only).
Project: C:/Users/10adn/OneDrive/Documents/Projects/Advoxy_Projects/Project_Fruzodrinks/fruzo

## Product reconstruction
The unchanged public/images product cutouts and Fruzodrinks.pdf are the source of truth.
mangoBottle.ts measures the source silhouette in pixels, then creates curved bottle and cap geometry.
Authentic photographic pixels are projected onto those curved surfaces near the front view.
The original label is also mapped around the cylindrical body. No generated brand text replaces it.
The independently modelled cap, mouth, physical liquid and rear remain true 3D during the complete turn.
Photo detail fades smoothly at oblique views; it is never used as a permanent flat billboard.
Each of the ten flavours has its own authentic source image, cap colour, label bounds and liquid treatment.

The source artwork obscures parts of the base with fruit. Those occluded areas are reconstructed.
Rear packaging and hidden geometry are provisional, not verified packaging dimensions.
The rear label uses the authentic logo and slogan plus the words PROVISIONAL ARTWORK.
Replace it when official wraparound artwork or multi-angle product photographs are available.
Front comparisons: qa/product-accuracy/final/all-ten-comparison.jpg.
?productProof=front is a QA-only preview setting that holds carousel models front-facing and closed.

## Animation modules
- mangoBottle.ts: geometry, original photo textures, rear label, separate cap, level liquid surface.
- createJuiceFlow.ts: variable cross-section stream, gravity trajectory, flared sheet, separated droplets.
- createCinematic.ts: renderer, cap states, ten flavour compositions, independent fruit and fluid.
- createHomeExperience.ts: existing journey and carousel, real 3D fall keyframes, scroll timing.
- cinematicConfig.ts: desktop/mobile distances, scrub, limiter, falling intensity, tilt and liquid timing.

The mouth dome and constant-width TubeGeometry pour have been removed.
Flow starts at the lower rim of the opening after the bottle tilts and cap clears.
Initial velocity follows the bottle's orientation; gravity stays vertical in scene space.
Waves advance downstream through a deforming stream, which spreads into a sheet.
Droplets follow varied trajectories and taper to zero at lifecycle boundaries.
This is an art-directed procedural visualization, not a fluid or manufacturing simulation.

The second-to-third-section flip is a Three.js pitch/depth motion. No CSS card flip is used.
Scrub catch-up keeps the rendered bottle visible while the animation catches up with fast scrolling.
The first hero-to-story composition and scroll distance are retained.
The selected carousel bottle opens once, then maintains restrained flow/fruit motion.
Outgoing caps close while their effects settle. New input supersedes prior transitions.

## Tuning
cinematicConfig.ts:
- hero.desktopScreens / mobileScreens: added sticky hero scroll distance.
- hero.scrubSeconds: cinematic progress smoothing.
- journey.scrubSeconds / mobileScrubSeconds: movement smoothing.
- wheelLimiter.enabled: false disables moderation globally.
- wheelLimiter.threshold / maxDelta / duration: unusually large wheel input handling.
- flip.pitch / yaw / depth / roll: controlled falling motion.
- liquid.tilt / revealStart / revealFull: pouring pose and reveal.
- carousel.slideSeconds / openSeconds / closeSeconds: interaction timing.
- rendering.desktopDpr / mobileDpr / mobileFps: rendering budget.

?wheelLimiter=off disables the limiter for a review session.
Small wheel deltas, touch, keyboard, scrollbar dragging and anchor links retain normal access.
Native devices do not have identical physical scroll speed; smoothing does not guarantee that.
Reduced-motion mode removes WebGL and the extended chapter. The original product imagery remains.
WebGL failure retains the product imagery and navigation. Hidden and offscreen scenes pause rendering.

## Supporting assets
Original generated mango sources are retained in source/cinematic:
- mango-cheek-generated.png
- mango-slice-generated.png
Optimized transparent WebP files are in frontend/public/cinematic.
These supporting fruit assets were generated with the built-in image-generation tool.
No reference-video frames were used as assets. Fruzo branding was not generated.

Cheek prompt: One isolated photorealistic ripe mango cheek sliced into a scored hedgehog shape,
golden orange juicy flesh, subtle fibrous texture, thin natural red-green skin edge,
premium studio beverage photography, three-quarter perspective, softbox and gentle rim light,
true transparent background, no floor, splash, leaves, text, branding or bottle.

Slice prompt: A single photorealistic curved slice of ripe mango, golden-orange flesh,
thin red-green peel, three-quarter side view, subtle highlights, transparent background,
no glow, floor, ground shadow, other objects or text.

## Verification and replay
From fruzo/frontend: npm run typecheck; npm run lint; npm test; npm run build.
From fruzo: node scripts/verify-product-accuracy.cjs.
Set FRUZO_PREVIEW_URL to target a different local port.
The browser script never submits an enquiry or sends email.
It checks 66 states/interactions, including all ten flavours, the full turn, reverse scrolling,
fast wheel input, keyboard/anchor navigation, falling, touch swipe, product routes,
enquiry preselection, reduced motion, WebGL fallback and page/shader errors.

node scripts/capture-cinematic-preview.cjs saves source comparisons and a real browser recording.
Review recording: qa/product-accuracy/final/cinematic-preview.webm.
Device checks use Edge with desktop and mobile/touch emulation. Physical phone GPU performance
has not been measured; the mobile rendering budget is capped at 30 fps and DPR 1.2.

## Safety
Fresh verified snapshot:
Project_Fruzodrinks_backups/before-product-accuracy-20261013-114323
539 backed-up files; SHA-256 manifest and Git status retained.
Backend source/configuration and logical database contents were verified unchanged.
No enquiry was submitted. No email service was connected. No deployment occurred.
Existing repository dependency-audit findings require separate maintenance before deployment.

