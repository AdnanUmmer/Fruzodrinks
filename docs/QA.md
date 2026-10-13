# Verification report — 1 October 2026

## Passed

- Frontend `npm test`: 2 tests passed.
- Frontend `npm run lint` and `npm run typecheck` passed.
- Frontend production `npm run build` passed from an isolated copy of the current frontend source and dependencies. The repository's existing `.next/standalone` directory was in use by a pre-existing server, so the build was isolated rather than stopping that process.
- `node tests/http-smoke.mjs` passed against the built standalone server. It checked all public routes, the ten seeded products, unique metadata, canonical/social tags, JSON-LD parsing, sitemap, robots, unknown-product 404, and enquiry origin/validation responses.
- Optimized product-image request returned HTTP 200 with an image response from the standalone server.
- Django `manage.py check`, `manage.py makemigrations --check --dry-run`, and `manage.py test catalogue`: passed; 28 backend tests.
- `collectstatic` with `config.settings.static_build` generated `staticfiles.json` in a disposable test directory.
- Browser spot checks covered homepage, product collection/detail, FAQ, contact, privacy, and unknown-product pages. Viewports from 320 px through 1920 px had no document-level horizontal overflow. Reduced-motion mode, skip-link focus, Enter navigation, flavour keyboard controls, mobile select/swipe, and labelled enquiry controls were checked.

## Warnings and unverified environments

- Django `check --deploy` reports only `security.W005` and `security.W021`: HSTS subdomains and preload remain opt-in until the owner confirms every subdomain is HTTPS-only and approves preload.
- The worktree's default build output could not be rebuilt while the pre-existing standalone server held it open on Windows (`EBUSY`); the isolated production build completed successfully.
- Docker/Compose is not installed in this environment, so image builds and `docker compose config` were not run. Production PostgreSQL connectivity, real SMTP delivery, HTTPS/DNS, persistent-volume survival, and restore procedures require infrastructure and credentials not present locally.
- Browser checks are focused smoke checks, not a formal WCAG audit or real-device performance measurement. No enquiry was inserted into the persistent local database during runtime smoke testing.