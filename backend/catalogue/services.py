import logging
import time
from datetime import timedelta
from django.conf import settings
from django.core.mail import EmailMessage
from django.db.models import F
from django.utils import timezone
from django.utils.crypto import salted_hmac
from .models import RateLimitBucket

logger = logging.getLogger(__name__)

def rate_allowed(identity, scope, limit, seconds=3600):
    window = int(time.time()) // seconds
    key = salted_hmac('fruzo-rate-limit', f'{scope}:{identity}:{window}').hexdigest()
    RateLimitBucket.objects.get_or_create(key=key, defaults={'expires_at': timezone.now()+timedelta(seconds=seconds*2)})
    # Conditional atomic UPDATE works across workers, including PostgreSQL.
    return bool(RateLimitBucket.objects.filter(key=key, count__lt=limit).update(count=F('count')+1))

def client_identity(request):
    # Only set behind the supplied edge config: it OVERWRITES this header.
    if settings.TRUST_PROXY_CLIENT_IP:
        return request.META.get('HTTP_X_REAL_IP', request.META.get('REMOTE_ADDR', 'unknown'))
    return request.META.get('REMOTE_ADDR', 'unknown')

def notify_enquiry(enquiry):
    if not settings.ENQUIRY_NOTIFICATION_EMAIL:
        return False
    try:
        email = EmailMessage(
            subject=f'New Fruzo enquiry #{enquiry.pk}',
            body=f'A new enquiry is saved in the Fruzo Brand studio.\nOpen /admin/catalogue/enquiry/{enquiry.pk}/change/ to review it.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.ENQUIRY_NOTIFICATION_EMAIL],
        )
        if email.send(fail_silently=False) != 1:
            return False
        enquiry.notified_at = timezone.now()
        enquiry.save(update_fields=['notified_at'])
        return True
    except Exception:
        # Never log customer messages, credentials or SMTP exception text.
        logger.warning('Enquiry %s stored; notification pending.', enquiry.pk)
        return False
