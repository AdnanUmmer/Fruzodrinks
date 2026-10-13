from io import BytesIO
from uuid import uuid4
from django.core.files.base import ContentFile
from django.core.validators import RegexValidator, MinValueValidator
from django.db import models
from PIL import Image, ImageOps
from .validators import validate_image

color = RegexValidator(r'^#[0-9a-fA-F]{6}$', 'Use a six-digit hex colour, for example #F7B331.')

def asset_path(instance, filename):
    return f'products/{uuid4().hex}.webp'

def normalize_image(field):
    if field and not field._committed:
        validate_image(field)
        with Image.open(field) as original:
            image = ImageOps.exif_transpose(original).convert('RGBA')
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            buffer = BytesIO()
            image.save(buffer, format='WEBP', quality=90, method=5)
        field.save(f'{uuid4().hex}.webp', ContentFile(buffer.getvalue()), save=False)

class Product(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    flavor = models.CharField('flavour', max_length=60)
    short_description = models.CharField(max_length=240, blank=True)
    description = models.TextField(blank=True)
    bottle_image = models.ImageField(upload_to=asset_path, validators=[validate_image], blank=True,
        help_text='Transparent PNG/WebP preferred. Max 8 MB; converted to WebP on save.')
    image_alt = models.CharField(max_length=180, blank=True)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=170, blank=True)
    share_image = models.ImageField(upload_to=asset_path, validators=[validate_image], blank=True)
    catalogue_asset = models.CharField(max_length=160, blank=True, editable=False)
    decoration_asset = models.CharField(max_length=160, blank=True, editable=False)
    catalogue_page = models.PositiveSmallIntegerField(null=True, blank=True, editable=False)
    primary_color = models.CharField(max_length=7, validators=[color], default='#F7B331')
    secondary_color = models.CharField(max_length=7, validators=[color], default='#FFD777')
    accent_color = models.CharField(max_length=7, validators=[color], default='#234B2D')
    text_color = models.CharField(max_length=7, validators=[color], default='#173B26')
    volume_ml = models.PositiveSmallIntegerField(default=200, validators=[MinValueValidator(1)])
    carton_units = models.PositiveSmallIntegerField(default=30, validators=[MinValueValidator(1)])
    ingredients = models.TextField(blank=True, help_text='Only approved ingredient text. Leave blank when unavailable.')
    nutrition = models.TextField(blank=True, help_text='Only approved nutritional information. Leave blank when unavailable.')
    display_order = models.PositiveSmallIntegerField(default=0)
    active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'pk']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        normalize_image(self.bottle_image)
        normalize_image(self.share_image)
        result = super().save(*args, **kwargs)
        self.bottle_image.close()
        self.share_image.close()
        return result

class FlavorAsset(models.Model):
    product = models.ForeignKey(Product, related_name='assets', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=asset_path, validators=[validate_image])
    alt_text = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=[('foreground', 'Foreground'), ('background', 'Background')], default='foreground')
    display_order = models.PositiveSmallIntegerField(default=0)
    class Meta:
        ordering = ['display_order', 'pk']
    def save(self, *args, **kwargs):
        normalize_image(self.image)
        return super().save(*args, **kwargs)

class SiteContent(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, editable=False)
    brand_name = models.CharField(max_length=80, default='Fruzo')
    tagline = models.CharField(max_length=160, default='Refreshing Every Moment')
    headline = models.CharField(max_length=160, default='Small Bottle. Big Happiness.')
    company_name = models.CharField(max_length=160, default='Almas Refreshment and Beverages')
    address = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    contact_heading = models.CharField(max_length=100, default='Say hello.')
    contact_intro = models.TextField(blank=True)
    footer_note = models.CharField(max_length=240, blank=True)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=170, blank=True)
    privacy_notice = models.TextField(blank=True, help_text='Approved privacy notice: purpose, retention, rights and contact. Required before public launch.')
    updated_at = models.DateTimeField(auto_now=True)
    story = models.TextField(blank=True, help_text='Approved brand copy only.')
    class Meta:
        verbose_name_plural = 'Brand and contact content'
    def save(self, *args, **kwargs):
        self.pk = 1
        return super().save(*args, **kwargs)
    def __str__(self):
        return self.brand_name


class FAQ(models.Model):
    question = models.CharField(max_length=240)
    answer = models.TextField(max_length=4000)
    display_order = models.PositiveSmallIntegerField(default=0)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['display_order', 'pk']
        verbose_name = 'FAQ'
    def __str__(self):
        return self.question

class Enquiry(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'New'
        IN_PROGRESS = 'in_progress', 'In progress'
        COMPLETED = 'completed', 'Completed'
        SPAM = 'spam', 'Spam'
    name = models.CharField(max_length=100)
    company = models.CharField(max_length=160, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    subject = models.CharField(max_length=160)
    enquiry_type = models.CharField(max_length=20, choices=[('general','General'),('distribution','Distribution'),('product','Product')], default='general')
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL)
    message = models.TextField(max_length=5000)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    submitted_at = models.DateTimeField(auto_now_add=True)
    notified_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ['-submitted_at']
    def __str__(self):
        return f'{self.subject} — {self.name}'

class RateLimitBucket(models.Model):
    # HMAC digests only; no raw IP addresses or enquiry content.
    key = models.CharField(max_length=64, primary_key=True)
    count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(db_index=True)
