from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase, override_settings, Client
from .models import Product, SiteContent, FlavorAsset
from .validators import validate_image

def upload():
    out=BytesIO()
    Image.new('RGBA',(80,120),(200,100,30,255)).save(out,format='PNG')
    return SimpleUploadedFile('test.png',out.getvalue(),content_type='image/png')

class CatalogueTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_catalogue',verbosity=0)

    def test_all_verified_products_and_sizes(self):
        response=self.client.get('/api/products/')
        self.assertEqual(response.status_code,200)
        data=response.json()
        self.assertEqual(len(data),10)
        self.assertEqual({p['flavor'] for p in data},{'Mango','Lemon','Lemon Salt','Dew','Apple','Pineapple','Mixed Fruits','Green Apple','Nannari','Cola'})
        self.assertTrue(all(p['volume_ml']==200 and p['carton_units']==30 for p in data))
        self.assertTrue(all(not p['ingredients'] and not p['nutrition'] for p in data))

    def test_every_detail_route_and_unknown_slug(self):
        for product in Product.objects.all():
            response=self.client.get(f'/api/products/{product.slug}/')
            self.assertEqual(response.status_code,200)
            self.assertEqual(response.json()['name'],product.name)
        self.assertEqual(self.client.get('/api/products/not-a-flavor/').status_code,404)

    def test_inactive_products_are_not_public(self):
        product=Product.objects.get(slug='mango')
        product.active=False
        product.save()
        self.assertEqual(len(self.client.get('/api/products/').json()),9)
        self.assertEqual(self.client.get('/api/products/mango/').status_code,404)

    def test_order_is_data_driven(self):
        Product.objects.filter(slug='cola').update(display_order=0)
        Product.objects.exclude(slug='cola').update(display_order=5)
        self.assertEqual(self.client.get('/api/products/').json()[0]['slug'],'cola')

    def test_seed_is_idempotent_and_preserves_editorial_changes(self):
        Product.objects.filter(slug='mango').update(description='Approved edited copy')
        call_command('seed_catalogue',verbosity=0)
        self.assertEqual(Product.objects.count(),10)
        self.assertEqual(Product.objects.get(slug='mango').description,'Approved edited copy')

    def test_contact_uses_corrected_rendered_pdf(self):
        data=self.client.get('/api/site/').json()
        self.assertEqual(data['email'],'info@fruzodrinks.com')
        self.assertEqual(data['company_name'],'Almas Refreshment and Beverages')

    def test_public_api_is_read_only_and_admin_requires_login(self):
        self.assertEqual(self.client.post('/api/products/',{'name':'bad'}).status_code,405)
        self.assertEqual(self.client.delete('/api/products/mango/').status_code,405)
        self.assertRedirects(self.client.get('/admin/catalogue/product/'),'/admin/login/?next=/admin/catalogue/product/',fetch_redirect_response=False)

    def test_invalid_colors_and_images_rejected(self):
        p=Product.objects.first()
        p.primary_color='url(javascript:bad)'
        with self.assertRaises(ValidationError):
            p.full_clean()
        for contents in [b'<svg><script>alert(1)</script></svg>',b'not an image']:
            with self.assertRaises(ValidationError):
                validate_image(SimpleUploadedFile('test.png',contents,content_type='image/png'))

    def test_upload_is_validated_normalized_and_served_in_api(self):
        with TemporaryDirectory(dir=Path(__file__).resolve().parents[1], prefix='.test-media-') as media,override_settings(MEDIA_ROOT=media):
            p=Product.objects.first()
            p.bottle_image=upload()
            p.save()
            self.assertTrue(p.bottle_image.name.endswith('.webp'))
            with Image.open(p.bottle_image.path) as image:
                self.assertEqual(image.format,'WEBP')
            self.assertTrue(self.client.get(f'/api/products/{p.slug}/').json()['image'].startswith('/media/products/'))
            self.assertTrue(Path(p.bottle_image.path).exists())
            asset=FlavorAsset.objects.create(product=p,image=upload(),alt_text='Approved fruit image')
            data=self.client.get(f'/api/products/{p.slug}/').json()
            self.assertEqual(data['assets'][0]['alt_text'],'Approved fruit image')
            self.assertTrue(asset.image.name.endswith('.webp'))

    def test_eleventh_product_works_without_architecture_changes(self):
        p=Product.objects.create(name='Test-only product',slug='test-only',flavor='Test',display_order=11)
        self.assertEqual(len(self.client.get('/api/products/').json()),11)
        self.assertEqual(self.client.get(f'/api/products/{p.slug}/').status_code,200)

class AdminTests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_superuser('qa-admin','qa@example.invalid','test-password-never-used-outside-tests')
        self.client.force_login(self.user)

    def product_form(self):
        return {'name':'QA only','slug':'qa-only','flavor':'QA','short_description':'','description':'',
            'primary_color':'#AABBCC','secondary_color':'#FFEEDD','accent_color':'#123456','text_color':'#123456',
            'volume_ml':200,'carton_units':30,'display_order':0,'active':'on',
            'assets-TOTAL_FORMS':0,'assets-INITIAL_FORMS':0,'assets-MIN_NUM_FORMS':0,'assets-MAX_NUM_FORMS':1000}

    def test_admin_create_upload_update_and_delete(self):
        with TemporaryDirectory(dir=Path(__file__).resolve().parents[1], prefix='.test-media-') as media,override_settings(MEDIA_ROOT=media):
            data=self.product_form()
            data['bottle_image']=upload()
            response=self.client.post('/admin/catalogue/product/add/',data)
            self.assertEqual(response.status_code,302)
            p=Product.objects.get(slug='qa-only')
            self.assertTrue(p.bottle_image.name.endswith('.webp'))
            data=self.product_form()
            data['description']='An approved edit'
            self.assertEqual(self.client.post(f'/admin/catalogue/product/{p.pk}/change/',data).status_code,302)
            p.refresh_from_db()
            self.assertEqual(p.description,'An approved edit')
            self.assertEqual(self.client.post(f'/admin/catalogue/product/{p.pk}/delete/',{'post':'yes'}).status_code,302)
            self.assertFalse(Product.objects.filter(pk=p.pk).exists())

    def test_admin_post_requires_csrf_with_real_browser_semantics(self):
        client=Client(enforce_csrf_checks=True)
        client.force_login(self.user)
        self.assertEqual(client.post('/admin/catalogue/product/add/',self.product_form()).status_code,403)

    def test_site_content_singleton(self):
        SiteContent.objects.create(company_name='QA company')
        self.assertEqual(SiteContent.objects.count(),1)
        SiteContent(company_name='Updated QA company').save()
        self.assertEqual(SiteContent.objects.count(),1)
