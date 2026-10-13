from urllib.parse import urlsplit
from django.core.exceptions import ImproperlyConfigured

def validate_origin(value, production=False):
    try:
        url = urlsplit(value)
        valid = (url.scheme in ('http','https') and url.hostname and not url.username and not url.password
                 and url.path in ('','/') and not url.query and not url.fragment and ',' not in value and not any(c.isspace() for c in value))
        _ = url.port
        if production:
            valid = valid and url.scheme == 'https' and url.hostname not in ('localhost','127.0.0.1','::1')
        if not valid:
            raise ValueError()
    except ValueError:
        raise ImproperlyConfigured('Use exactly one HTTP(S) origin; production requires a public HTTPS origin.') from None
    return value.rstrip('/')
