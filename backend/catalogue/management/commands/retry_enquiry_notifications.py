from django.core.management.base import BaseCommand
from catalogue.models import Enquiry
from catalogue.services import notify_enquiry

class Command(BaseCommand):
    help = 'Retry up to 100 stored, unsent enquiry notifications. Run one worker only.'
    def handle(self, *args, **options):
        sent = 0
        for enquiry in Enquiry.objects.filter(notified_at__isnull=True).exclude(status='spam').order_by('submitted_at')[:100]:
            sent += int(notify_enquiry(enquiry))
        self.stdout.write(f'{sent} notifications sent.')
