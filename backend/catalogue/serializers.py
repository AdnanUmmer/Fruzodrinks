from rest_framework import serializers
from .models import Product, FlavorAsset, SiteContent

class FlavorAssetSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    def get_image(self, obj):
        return obj.image.url
    class Meta:
        model = FlavorAsset
        fields = ['image', 'alt_text', 'role', 'display_order']

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    assets = FlavorAssetSerializer(many=True, read_only=True)
    def get_image(self, obj):
        return obj.bottle_image.url if obj.bottle_image else obj.catalogue_asset
    class Meta:
        model = Product
        fields = ['name', 'slug', 'flavor', 'short_description', 'description', 'image', 'assets', 'decoration_asset',
            'primary_color', 'secondary_color', 'accent_color', 'text_color', 'volume_ml', 'carton_units',
            'ingredients', 'nutrition', 'display_order', 'catalogue_page', 'updated_at']

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContent
        fields = ['brand_name', 'tagline', 'headline', 'company_name', 'address', 'email', 'website', 'story']
