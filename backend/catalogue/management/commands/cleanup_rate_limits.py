from django.core.management.base import BaseCommand
from django.utils import timezone
from catalogue.models import RateLimitBucket

class Command(BaseCommand):
    help = 'Delete expired rate-limit counters. Run daily.'
    def handle(self, *args, **options):
        count, _ = RateLimitBucket.objects.filter(expires_at__lt=timezone.now()).delete()
        self.stdout.write(f'{count} expired counters removed.')
