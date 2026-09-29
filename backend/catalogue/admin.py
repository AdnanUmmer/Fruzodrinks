from django.contrib import admin
from django.conf import settings
from django.utils.html import format_html
from .models import Product, FlavorAsset, SiteContent

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
        ('Artwork', {'fields': ['preview', 'bottle_image']}),
        ('Flavour world', {'fields': ['primary_color', 'secondary_color', 'accent_color', 'text_color']}),
        ('Approved product information', {'fields': ['volume_ml', 'carton_units', 'ingredients', 'nutrition']}),
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
    def has_add_permission(self, request):
        return not SiteContent.objects.exists()
    def has_delete_permission(self, request, obj=None):
        return False
