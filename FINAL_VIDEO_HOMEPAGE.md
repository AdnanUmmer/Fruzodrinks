# Final video homepage — 14 October 2026

## Preview
http://127.0.0.1:3001/

## Source and implementation
- The folder contains one final film: frontend/public/vid/Hero-section.mp4 (8 seconds, 1280 × 720, approximately 3.35 MB).
- Inspected seven decoded frames including first and last. The film already contains the empty-to-filled Mango bottle, cap choreography, fruit, liquid, background and headline. It is displayed intact, with no duplicate product or headline overlay.
- HeroVideo.tsx is the only scroll animation. GSAP pins the hero for 1.65 viewport heights on desktop and 1.25 on mobile, with 0.22-second scrub smoothing. One seek is active at a time; subsequent scroll input replaces the queued target. Reverse scrolling uses the same progress mapping. No playback/autoplay is used.
- Full landscape composition is retained on mobile rather than cropping its embedded text or product. Reduced motion skips the video request and pin entirely. Still image control and video-error fallback use an extracted final frame.
- All subsequent homepage sections use normal scrolling. The ten supplied product compositions retain their authentic artwork. The carousel is manual, supports both directions, wraparound, touch and keyboard, and settles cleanly after rapid input.
- Existing ingredient cutouts add restrained movement only where suitable. No new ingredients are depicted for Cola, Dew or Nannari.
- Removed the travelling bottle, Three.js renderer, procedural liquid, cap model, wheel limiter, delivery markup and unused 3D modules. Historical assets and original source media remain preserved.
- Homepage arrows removed except the two thin angle controls in the flavour section.
- Shared footer rebuilt with aligned brand, company/contact, navigation and connection columns, plus a separate copyright/privacy row. Product pages and backend were not redesigned.

## Verification
scripts/verify-hero-video.cjs: desktop/mobile forward and reverse seeking, fast position changes, paused playback and visible framing.
scripts/verify-final-video-home.cjs: ten flavours, both wraparound directions, rapid navigation, mobile swipe, overflow, reduced motion, failed-video fallback and runtime errors.
Visual checkpoints: qa/hero-video/ (source frames, hero frames, subsequent sections and desktop/mobile footer).
Production build, TypeScript and targeted ESLint passed; existing unit tests passed.

## Backup
C:\Users\10adn\OneDrive\Documents\Projects\Advoxy_Projects\Project_Fruzodrinks_backups\before-hero-video-20261014-171533
527 files preserved; ordinary files SHA-256 verified and SQLite backed up consistently with an integrity check. MANIFEST.json and GIT-STATUS.txt are included.

No new dependencies. No backend changes. No deployment. Seek performance was verified in local Edge desktop and mobile emulation; physical iOS/Android hardware was not available.
