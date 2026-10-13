from django.contrib import admin
from django.conf import settings
from django.utils.html import format_html
from .models import Product, FlavorAsset, SiteContent, FAQ, Enquiry

admin.site.site_header = 'Fruzo · Brand studio'
admin.site.site_title = 'Fruzo admin'
admin.site.index_title = 'Your flavours. Your world.'

class FlavorAssetInline(admin.TabularInline):
    model = FlavorAsset
    extra = 0

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'flavor', 'swatch', 'volume_ml', 'display_order', 'active']
    list_editable = ['display_order', 'active']
    list_filter = ['active', 'volume_ml']
    search_fields = ['name', 'flavor', 'description']
    prepopulated_fields = {'slug': ['name']}
    readonly_fields = ['preview', 'updated_at']
    inlines = [FlavorAssetInline]
    fieldsets = [
        ('Product', {'fields': ['name', 'slug', 'flavor', 'short_description', 'description']}),
        ('Artwork', {'fields': ['preview', 'bottle_image', 'image_alt']}),
        ('Flavour world', {'fields': ['primary_color', 'secondary_color', 'accent_color', 'text_color']}),
        ('Approved product information', {'fields': ['volume_ml', 'carton_units', 'ingredients', 'nutrition']}),
        ('Search and sharing', {'fields': ['seo_title', 'seo_description', 'share_image']}),
        ('Publishing', {'fields': ['active', 'display_order', 'updated_at']}),
    ]
    @admin.display(description='Colour')
    def swatch(self, obj):
        return format_html('<span style="display:inline-block;width:28px;height:20px;background:{};border:1px solid #777;border-radius:5px"></span>', obj.primary_color)
    @admin.display(description='Artwork preview')
    def preview(self, obj):
        if obj.bottle_image:
            return format_html('<img src="{}" style="max-height:220px;max-width:200px" alt="Product artwork">', obj.bottle_image.url)
        if obj.catalogue_asset:
            return format_html('<img src="{}{}" style="max-height:220px;max-width:200px" alt="Catalogue artwork">', settings.FRONTEND_ORIGIN, obj.catalogue_asset)
        return 'No artwork uploaded.'

@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    readonly_fields = ['updated_at']
    fieldsets = [
        ('Brand and home page', {'fields':['brand_name','tagline','headline','story']}),
        ('Company and contact', {'fields':['company_name','address','email','phone','website','contact_heading','contact_intro']}),
        ('Social and footer', {'fields':['instagram_url','facebook_url','footer_note']}),
        ('Search defaults', {'fields':['seo_title','seo_description']}),
        ('Privacy and publishing', {'fields':['privacy_notice','updated_at']}),
    ]
    def has_add_permission(self, request):
        return not SiteContent.objects.exists()
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'display_order', 'active', 'updated_at']
    list_editable = ['display_order', 'active']
    list_filter = ['active']
    search_fields = ['question', 'answer']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ['subject', 'name', 'enquiry_type', 'status', 'submitted_at', 'notified_at']
    list_filter = ['status', 'enquiry_type', 'submitted_at']
    search_fields = ['name', 'company', 'email', 'subject', 'message']
    list_editable = ['status']
    date_hierarchy = 'submitted_at'
    readonly_fields = ['name','company','email','phone','subject','enquiry_type','product','message','submitted_at','notified_at']
    fields = readonly_fields + ['status']
    def has_add_permission(self, request):
        return False
