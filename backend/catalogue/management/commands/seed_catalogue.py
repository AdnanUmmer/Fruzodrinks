from django.core.management.base import BaseCommand
from django.db import transaction
from catalogue.models import Product, SiteContent

PRODUCTS = [
    ('mango','Mango',5,'#F8B536','#FFD878','#31552C','#173B26'),
    ('lemon','Lemon',2,'#F5D943','#FFF19A','#31552C','#173B26'),
    ('lemon-salt','Lemon Salt',2,'#EDE9A8','#FFFACF','#31552C','#173B26'),
    ('dew','Dew',3,'#B1DA4D','#E4F6A6','#225C30','#173B26'),
    ('apple','Apple',4,'#F29285','#FFC2AB','#6E201D','#4A201D'),
    ('pineapple','Pineapple',4,'#E1D953','#F7F1A4','#31552C','#173B26'),
    ('mixed-fruits','Mixed Fruits',5,'#EE9EAF','#F9C7D0','#682944','#49213C'),
    ('green-apple','Green Apple',6,'#AAD969','#DBEFA8','#225C30','#173B26'),
    ('nannari','Nannari',6,'#D89B60','#F4CD9B','#60351C','#402D20'),
    ('cola','Cola',3,'#4F2324','#7F3D31','#FFE4AC','#FFF4D8'),
]

class Command(BaseCommand):
    help = 'Seed only verified catalogue facts. Existing editorial changes are preserved.'
    @transaction.atomic
    def handle(self, *args, **options):
        for order,(slug,flavor,page,bg,secondary,accent,text) in enumerate(PRODUCTS):
            product,_ = Product.objects.get_or_create(slug=slug, defaults={
                'name': f'Fruzo {flavor}', 'flavor': flavor,
                'short_description': 'Small Bottle. Big Happiness.',
                'description': f'{flavor}, in a 200 ml Fruzo bottle. Available in cartons of 30.',
                'catalogue_asset': f'/images/{slug}.webp', 'catalogue_page': page,
                'primary_color': bg, 'secondary_color': secondary, 'accent_color': accent,
                'text_color': text, 'display_order': order,
            })
            if not product.decoration_asset:
                product.decoration_asset = f'/images/fruit-{slug}.webp'
                product.save(update_fields=['decoration_asset'])
        SiteContent.objects.get_or_create(pk=1, defaults={
            'address': 'Kottopadam, Mannarkkad, Palakkad district, Kerala, India.',
            'email': 'info@fruzodrinks.com', 'website': 'https://www.fruzodrinks.com',
            'story': 'Fruzo by Almas Refreshment and Beverages. Kottopadam, Mannarkkad, Palakkad district, Kerala, India.',
        })
        self.stdout.write(self.style.SUCCESS(f'Catalogue ready: {Product.objects.count()} products.'))
