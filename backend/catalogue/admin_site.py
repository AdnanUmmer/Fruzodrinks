from django.contrib.admin import AdminSite

class BrandAdminSite(AdminSite):
    site_header = 'Fruzo · Brand studio'
    site_title = 'Fruzo Brand studio'
    index_title = 'Your flavours. Your world.'
    index_template = 'admin/brand_index.html'
    @property
    def site_url(self):
        from django.conf import settings
        return settings.FRONTEND_ORIGIN

    def index(self, request, extra_context=None):
        from .models import Product, FAQ, Enquiry
        cards = []
        if request.user.has_perm('catalogue.view_product'):
            cards.extend([
                {'label':'Total products','value':Product.objects.count(),'url':'/admin/catalogue/product/'},
                {'label':'Published','value':Product.objects.filter(active=True).count(),'url':'/admin/catalogue/product/?active__exact=1'},
                {'label':'Drafts','value':Product.objects.filter(active=False).count(),'url':'/admin/catalogue/product/?active__exact=0'},
            ])
        if request.user.has_perm('catalogue.view_faq'):
            cards.append({'label':'FAQs','value':FAQ.objects.count(),'url':'/admin/catalogue/faq/'})
        enquiries = Enquiry.objects.none()
        if request.user.has_perm('catalogue.view_enquiry'):
            cards.append({'label':'New enquiries','value':Enquiry.objects.filter(status='new').count(),'url':'/admin/catalogue/enquiry/?status__exact=new'})
            enquiries = Enquiry.objects.all()[:5]
        return super().index(request, {**(extra_context or {}), 'dashboard_cards':cards, 'recent_enquiries':enquiries})
