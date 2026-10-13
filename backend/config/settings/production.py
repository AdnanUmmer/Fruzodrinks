from django.core.exceptions import ImproperlyConfigured
from .base import *  # noqa: F403

DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '')
ALLOWED_HOSTS = [v.strip() for v in os.getenv('DJANGO_ALLOWED_HOSTS', '').split(',') if v.strip()]
if len(SECRET_KEY) < 50 or not ALLOWED_HOSTS or '*' in ALLOWED_HOSTS:
    raise ImproperlyConfigured('Production requires a secret of at least 50 characters and explicit allowed hosts.')
if DATABASES['default']['ENGINE'] != 'django.db.backends.postgresql':
    raise ImproperlyConfigured('Production requires a PostgreSQL DATABASE_URL.')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('HSTS_INCLUDE_SUBDOMAINS', '0') == '1'
SECURE_HSTS_PRELOAD = os.getenv('HSTS_PRELOAD', '0') == '1'
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
# Enable only behind an owned proxy that strips client-supplied forwarding headers.
if os.getenv('TRUST_PROXY_SSL_HEADER') == '1':
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

from config.origins import validate_origin
FRONTEND_ORIGIN = validate_origin(os.getenv('FRONTEND_ORIGIN', ''), production=True)
if not CSRF_TRUSTED_ORIGINS or not CORS_ALLOWED_ORIGINS:
    raise ImproperlyConfigured('Configure explicit HTTPS CSRF and CORS origins.')
for origin in CSRF_TRUSTED_ORIGINS + CORS_ALLOWED_ORIGINS:
    validate_origin(origin, production=True)
if not os.getenv('MEDIA_ROOT') or not MEDIA_ROOT.is_absolute() or MEDIA_ROOT.is_relative_to(BASE_DIR):
    raise ImproperlyConfigured('Set MEDIA_ROOT to an absolute persistent volume outside the application directory.')
if len(ENQUIRY_PROXY_TOKEN) < 32:
    raise ImproperlyConfigured('Set a random shared ENQUIRY_PROXY_TOKEN of at least 32 characters.')
SESSION_COOKIE_AGE = 8 * 60 * 60
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
