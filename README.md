# Fruzo — catalogue and enquiries

The existing Next.js / Django catalogue, original ten products and GSAP scroll experience are preserved. This repository adds a branded business administration area, editable FAQs and search metadata, and persistent enquiries. It is a catalogue, not a checkout. No prices, certifications, ingredients or reviews have been invented.

## Development

Requirements: Python 3.13+, Node 22.16+ (24 also works), npm. Local SQLite is convenient; production settings require PostgreSQL. Commands below run from the repository root unless stated otherwise. Windows uses `.venv\Scripts\python.exe`; POSIX uses `.venv/bin/python`.

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
```

Put that generated value in **both** files as `ENQUIRY_PROXY_TOKEN`. Keep it private. Set frontend `API_ORIGIN=http://127.0.0.1:8017` and `SITE_ORIGIN=http://127.0.0.1:3000`. SITE_ORIGIN is exactly one origin: no comma list, credentials, path, query or fragment. Use the matching browser address; localhost and 127.0.0.1 are distinct origins. Leave `DATABASE_URL` unset/blank for local SQLite. Do not copy blank development credentials into production.

```powershell
.venv\Scripts\python.exe backend/manage.py migrate
.venv\Scripts\python.exe backend/manage.py seed_catalogue
.venv\Scripts\python.exe backend/manage.py createsuperuser
.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8017
```

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Website: http://127.0.0.1:3000. Admin: http://127.0.0.1:8017/admin/. API: port 8017. For the optimized local build use `npm run build` then `npm start`; the start script copies public/static assets into Next's standalone output and binds to loopback. Do not run dev and production servers on the same port. Restart Django after backend changes if using `--noreload`.

### Validation

```powershell
.venv\Scripts\python.exe backend/manage.py test catalogue
.venv\Scripts\python.exe backend/manage.py check
.venv\Scripts\python.exe backend/manage.py makemigrations --check --dry-run
cd frontend
npm test
npm run lint
npm run typecheck
npm run build
node tests/http-smoke.mjs
```

The HTTP smoke test requires both servers running with the original ten products; it checks raw crawler HTML on every page, unique titles, descriptions, social metadata, canonicals, one H1, JSON-LD parsing, sitemap/robots, missing products, and enquiry origin/validation. Backend tests use isolated test databases, mock/locmem email and temporary uploads; no real email is sent. See [QA report](docs/QA.md) for actual results and unverified environments.

## Administration

Log in with your own staff account. Create a production superuser interactively; no account or password is shipped. Create limited staff users/groups for day-to-day operations, granting only needed model permissions. Dashboard cards and enquiry summaries respect those permissions. Login POSTs are rate limited (15 per IP / 15 minutes); use strong unique passwords and limit admin access at the edge if appropriate.

- **Products:** edit name, flavour, slug, copy, approved specifications and colours. `Active` publishes the product; untick it for a draft. Lower display order appears first. The explorer and catalogue update from the API without rebuilding. Slugs must be unique; changing a published slug changes its URL, so arrange a permanent redirect before changing established URLs.
- **Artwork:** upload PNG, JPEG or WebP, at most 8 MB / 6000 px / 25 megapixels. Images are decoded, validated, stripped of metadata and re-encoded to WebP at up to 1600 px. Animated files and SVG are rejected. Supply meaningful image alt text. Existing catalogue art remains the fallback when no upload is supplied. Additional decorative assets are available inline. Original extracted artwork is not a new studio bottle render; some printed fruit overlaps are part of the approved source image.
- **SEO:** optionally set each product's title (70 characters), description (170) and social share image. Blank fields fall back to product copy/artwork. No offer/rating schema is invented.
- **FAQs:** add plain-text questions and answers; draft by default. Set order and tick Active to publish. Public FAQ markup reflects only these visible answers. The empty state directs visitors to contact; no fabricated answers are seeded.
- **Brand and contact content:** edit hero headline/tagline, story, company/contact information, social links, contact heading/intro, footer note, default SEO and approved privacy notice. This is a singleton. Avoid marketing claims without substantiation.
- **Enquiries:** search/filter, read the submission, then set New / In progress / Completed / Spam. Customer-supplied fields are read-only in admin. Delete only after your approved retention period, using Django's confirmation screen. Regularly review spam and old enquiries according to that policy.
- **Deletion:** Django retains its confirmation screen and permission checks. Uploaded files are deliberately not auto-deleted when replacing/deleting products, to avoid accidental data loss. Include orphan-media review in maintenance; back up before removing confirmed unused files.

## Production architecture

Browser → Caddy HTTPS + canonical domain → Next.js → private Django/DRF → PostgreSQL. Caddy serves `/media/` from a persistent Docker volume, `/admin/` and `/static/` from Django/WhiteNoise, and the public enquiry route through Next. Raw `/api/*` is blocked at the edge. Database, Next and Django ports are not published. Only edge ports 80/443 are public. The provided configuration targets an ordinary Linux host with Docker Compose; no hosting vendor is assumed.

The edge **overwrites** `X-Real-IP`. Next only forwards that header when explicitly configured. Django trusts it only behind this private network. Next adds the trusted HTTPS forwarding header on its private backend requests so Django's SSL redirect does not redirect to an internal HTTPS hostname. Do not expose backend/Next ports or reuse these trust settings behind an untrusted proxy. If adding a CDN, configure and verify its trusted-proxy IP handling first; otherwise visitors may share a rate limit.

### Exact initial deployment

On the Linux host install Docker Engine + Compose from official packages. Allow 80/443, and restrict SSH. Point A/AAAA records for both chosen hostnames to this host; remove stale AAAA records. The example uses the existing Fruzo website domain, but the owner must confirm the canonical host and DNS control.

```sh
cp deploy/.env.example deploy/.env
chmod 600 deploy/.env
```

Fill `DOMAIN` (canonical bare hostname), `WWW_DOMAIN` (alternate), and matching `SITE_ORIGIN=https://DOMAIN`. Generate independent strong random values for POSTGRES_PASSWORD (URL-safe), DJANGO_SECRET_KEY (at least 50 characters), ENQUIRY_PROXY_TOKEN (at least 32). Set `RELEASE` to an immutable release identifier. Configure SMTP or leave notifications unconfigured: **enquiries are still stored**. Do not put spaces, URL punctuation or shell syntax in database passwords unless correctly URL-encoded in the database URL.

```sh
docker compose --env-file deploy/.env config --quiet
docker compose --env-file deploy/.env build
docker compose --env-file deploy/.env run --rm --no-deps edge caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker compose --env-file deploy/.env up -d db
docker compose --env-file deploy/.env run --rm backend python manage.py migrate
docker compose --env-file deploy/.env run --rm backend python manage.py seed_catalogue
docker compose --env-file deploy/.env run --rm backend python manage.py createsuperuser
docker compose --env-file deploy/.env run --rm backend python manage.py check --deploy
docker compose --env-file deploy/.env up -d
docker compose --env-file deploy/.env ps
```

Static files are collected into the backend image during build. The named `media` and `database` volumes survive container replacement. **Never use `docker compose down -v` on production.** Other deployment platforms must provide equivalent durable storage and serve media safely; ephemeral filesystem uploads are not acceptable. Initial deployment seeds catalogue records, not local database edits/uploads: migrate approved edited content and uploaded media separately with a verified backup/import plan.

Verify `/health/` returns 200; public pages, all products, true 404, `/sitemap.xml`, `/robots.txt`, HTTPS certificate, alternate-host permanent redirect and admin login. Submit a clearly labelled launch-test enquiry, verify its admin record, then test SMTP arrival. Restart/redeploy and confirm uploaded media and enquiries survive. Run a database restore rehearsal before opening to customers. Caddy automatically provisions TLS when DNS and inbound ports are correct; this has not been claimed configured locally.

HSTS is enabled for the canonical host. `security.W005` (includeSubDomains) and `security.W021` (preload) are intentional until the owner verifies HTTPS on every subdomain and approves preload. These warnings are not silenced. `DEBUG=False`, strong secrets, explicit hosts, HTTPS origins, PostgreSQL and a media path outside the application are enforced by production settings. `DJANGO_DEBUG` is deliberately not used: the production settings module always sets DEBUG false.

### Email, spam and privacy

Environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, EMAIL_USE_TLS/SSL (choose one), DEFAULT_FROM_EMAIL, ENQUIRY_NOTIFICATION_EMAIL. Backend SMTP timeout is 5 seconds. Messages are saved before delivery; notification emails contain an admin reference rather than customer content. `notified_at` remains blank until delivery succeeds. Run one retry process (delivery is at-least-once, so a crash after SMTP delivery can produce a duplicate notification):

```sh
docker compose --env-file deploy/.env exec -T backend python manage.py retry_enquiry_notifications
docker compose --env-file deploy/.env exec -T backend python manage.py cleanup_rate_limits
```

Schedule retry every few minutes and counter cleanup daily using the host scheduler, with a single execution at a time. The form uses server-side validation, a honeypot, bounded request size, same-origin checks, a private shared token and database-backed rate limits (five attempts per IP/hour across workers). Raw IPs are not stored in rate-limit records. Protect server access logs as they may contain network identifiers. No analytics or advertising trackers are added.

Before launch, the owner must approve the full privacy notice, retention period, process for access/deletion requests, and who receives enquiries. The repository does not invent legal policy. The basic fallback notice describes the implemented collection; it is not a reviewed legal policy. Update `privacy_notice` in Brand and contact content.

### Backups, restore and rollback

Use daily encrypted off-host backups with a retention policy approved for customer data. Back up database, uploaded media, deploy/.env (encrypted separately) and Caddy certificate storage. A server snapshot alone is not an off-host backup. Test restoration regularly. POSIX examples:

```sh
mkdir -p backups
docker compose --env-file deploy/.env exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > backups/fruzo.dump
docker compose --env-file deploy/.env exec -T backend tar -C /var/lib/fruzo/media -czf - . > backups/media.tar.gz
```

For a consistent database/media pair, briefly stop writes (backend/frontend) during backup or use a coordinated snapshot; account for unavailable public pages. Verify backup exit codes and test archives. Do not use old PowerShell binary redirection for these commands.

Restore to a **separate empty staging environment first**, with the correct release and secrets. Start the database, import the dump and media, then check records and file paths:

```sh
docker compose --env-file deploy/.env up -d db
docker compose --env-file deploy/.env exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error' < backups/fruzo.dump
docker compose --env-file deploy/.env run --rm -T backend tar -C /var/lib/fruzo/media -xzf - < backups/media.tar.gz
docker compose --env-file deploy/.env run --rm backend python manage.py migrate --check
docker compose --env-file deploy/.env up -d
```

Do not restore over an existing production database without a reviewed downtime/recovery plan. Back up before every release. For upgrades: build images with a new RELEASE tag, back up, stop backend writes if a migration requires it, run migrate once, then `up -d`. Retain the previous tagged images and Git revision. For rollback, restore the previous revision/config and image tag with `up -d --no-build` only if its code supports the current schema; otherwise restore the matching database/media backup during maintenance. Never blindly reverse migrations that may delete data.

### Monitoring and search launch

Use `docker compose --env-file deploy/.env logs --tail=100 backend frontend edge` for diagnosis. Do not log form bodies, secrets or SMTP exception text. Configure host/container log rotation and disk-space alerts. Monitor public `/health/`, homepage status/latency, enquiry notification backlog, backup age, SSL expiry and database/media disk usage. An optional error-monitoring service should redact personal data before being enabled; none is silently installed.

After DNS/HTTPS are live, use Google Search Console and Bing Webmaster Tools. Prefer DNS verification; alternatively set real GOOGLE_SITE_VERIFICATION and BING_SITE_VERIFICATION values in deploy/.env and recreate frontend. Never fabricate tokens. Submit the canonical `/sitemap.xml`; inspect representative URLs and canonical selection. FAQ structured data reflects visible answers but does not guarantee rich results. Product schema intentionally omits offers, reviews and ratings. Check real mobile performance and Core Web Vitals after deployment; local checks are not field data.

Deployment references: [Docker startup ordering](https://docs.docker.com/compose/how-tos/startup-order), [Caddy reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy).
