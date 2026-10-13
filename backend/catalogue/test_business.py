from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.core.management import call_command
from django.test import TestCase, SimpleTestCase, override_settings
from catalogue.models import FAQ, Product, Enquiry, RateLimitBucket
from config.origins import validate_origin

class FAQTests(TestCase):
    def test_only_published_faqs_in_editor_order_and_no_mutation(self):
        FAQ.objects.create(question='Draft',answer='Private answer')
        FAQ.objects.create(question='Second',answer='Two',active=True,display_order=2)
        FAQ.objects.create(question='First',answer='One',active=True,display_order=1)
        response=self.client.get('/api/faqs/')
        self.assertEqual([f['question'] for f in response.json()],['First','Second'])
        self.assertEqual(self.client.post('/api/faqs/',{}).status_code,405)
        self.assertEqual(set(response.json()[0]),{'id','question','answer','updated_at'})

@override_settings(ENQUIRY_PROXY_TOKEN='test-only-token', EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',ENQUIRY_NOTIFICATION_EMAIL='owner@example.invalid',DEFAULT_FROM_EMAIL='site@example.invalid')
class EnquiryTests(TestCase):
    def setUp(self):
        self.product=Product.objects.create(name='Test',slug='test',flavor='Test')
        self.data={'name':'Test customer','email':'customer@example.invalid','subject':'Catalogue question','message':'Please send more product information.','product':'test','enquiry_type':'product','website':''}
    def submit(self, data=None, **headers):
        return self.client.post('/api/enquiries/',data or self.data,content_type='application/json',HTTP_X_ENQUIRY_TOKEN='test-only-token',**headers)
    def test_valid_enquiry_stored_and_notified_without_exposing_record(self):
        response=self.submit()
        self.assertEqual(response.status_code,201)
        item=Enquiry.objects.get()
        self.assertEqual(item.product,self.product)
        self.assertEqual(item.status,'new')
        self.assertIsNotNone(item.notified_at)
        self.assertEqual(len(mail.outbox),1)
        self.assertNotIn(self.data['message'],mail.outbox[0].body)
        self.assertEqual(set(response.json()),{'detail'})
    def test_email_failure_keeps_enquiry_and_retry_succeeds(self):
        with patch('catalogue.services.EmailMessage.send',side_effect=OSError('offline')):
            self.assertEqual(self.submit().status_code,201)
        self.assertIsNone(Enquiry.objects.get().notified_at)
        call_command('retry_enquiry_notifications',verbosity=0)
        self.assertIsNotNone(Enquiry.objects.get().notified_at)
    @override_settings(ENQUIRY_NOTIFICATION_EMAIL='')
    def test_unconfigured_email_keeps_enquiry(self):
        self.assertEqual(self.submit().status_code,201)
        self.assertEqual(Enquiry.objects.count(),1)
        self.assertIsNone(Enquiry.objects.get().notified_at)
    def test_invalid_input_does_not_store(self):
        for field,value in [('email','bad'),('message','tiny'),('phone','javascript:bad'),('enquiry_type','admin')]:
            with self.subTest(field=field):
                self.assertEqual(self.submit({**self.data,field:value}).status_code,400)
        self.assertFalse(Enquiry.objects.exists())
    def test_unpublished_product_rejected(self):
        self.product.active=False;self.product.save()
        self.assertEqual(self.submit().status_code,400)
    def test_honeypot_does_not_store(self):
        self.assertEqual(self.submit({**self.data,'website':'https://spam.invalid'}).status_code,201)
        self.assertFalse(Enquiry.objects.exists())
    def test_mass_assignment_does_not_change_status(self):
        self.assertEqual(self.submit({**self.data,'status':'completed','notified_at':'2025-01-01'}).status_code,201)
        self.assertEqual(Enquiry.objects.get().status,'new')
    @override_settings(ENQUIRY_RATE_LIMIT=2)
    def test_shared_rate_limit_and_untrusted_forwarded_header(self):
        self.assertEqual(self.submit(HTTP_X_REAL_IP='1.1.1.1').status_code,201)
        self.assertEqual(self.submit(HTTP_X_REAL_IP='2.2.2.2').status_code,201)
        self.assertEqual(self.submit(HTTP_X_REAL_IP='3.3.3.3').status_code,429)
        self.assertEqual(Enquiry.objects.count(),2)
        self.assertEqual(RateLimitBucket.objects.count(),1)
    def test_no_public_read_or_direct_submission(self):
        self.assertEqual(self.client.get('/api/enquiries/').status_code,405)
        self.assertEqual(self.client.post('/api/enquiries/',self.data,content_type='application/json').status_code,403)
        self.assertEqual(self.client.get('/admin/catalogue/enquiry/').status_code,302)

class BusinessAdminTests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_superuser('studio','studio@example.invalid','test-only-password')
        self.client.force_login(self.user)
    def test_dashboard_and_faq_management(self):
        response=self.client.get('/admin/')
        self.assertContains(response,'A fresh look at your business.')
        self.assertContains(response,'New enquiries')
        response=self.client.post('/admin/catalogue/faq/add/',{'question':'Size?','answer':'200 ml','display_order':0,'active':'on'})
        self.assertEqual(response.status_code,302)
        self.assertEqual(self.client.get('/api/faqs/').json()[0]['answer'],'200 ml')
    def test_permission_limited_staff_cannot_see_enquiry_data(self):
        Enquiry.objects.create(name='Private name',email='private@example.invalid',subject='Private subject',message='Private')
        self.user.is_superuser=False;self.user.save()
        response=self.client.get('/admin/')
        self.assertNotContains(response,'Private name')
        self.assertNotContains(response,'Private subject')
    def test_duplicate_slug_validation(self):
        Product.objects.create(name='One',flavor='One',slug='same')
        with self.assertRaises(ValidationError):
            Product(name='Two',flavor='Two',slug='same').full_clean()

class OriginTests(SimpleTestCase):
    def test_valid_origin(self):
        self.assertEqual(validate_origin('https://fruzodrinks.com/',True),'https://fruzodrinks.com')
    def test_rejects_unsafe_production_origins(self):
        for value in ['http://fruzodrinks.com','https://localhost','https://a.com,https://b.com','https://user:pass@a.com','https://a.com/path','https://a.com?query=1','https://a.com#hash','https://a.com:bad','']:
            with self.subTest(value=value),self.assertRaises(ImproperlyConfigured):validate_origin(value,True)
