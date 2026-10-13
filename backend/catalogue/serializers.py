from rest_framework import serializers
from .models import Product, FlavorAsset, SiteContent, FAQ, Enquiry

class FlavorAssetSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    def get_image(self, obj):
        return obj.image.url
    class Meta:
        model = FlavorAsset
        fields = ['image', 'alt_text', 'role', 'display_order']

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    share_image = serializers.SerializerMethodField()
    def get_share_image(self, obj):
        return obj.share_image.url if obj.share_image else ''
    assets = FlavorAssetSerializer(many=True, read_only=True)
    def get_image(self, obj):
        return obj.bottle_image.url if obj.bottle_image else obj.catalogue_asset
    class Meta:
        model = Product
        fields = ['name', 'slug', 'flavor', 'short_description', 'description', 'image', 'assets', 'decoration_asset',
            'primary_color', 'secondary_color', 'accent_color', 'text_color', 'volume_ml', 'carton_units',
            'ingredients', 'nutrition', 'image_alt', 'seo_title', 'seo_description', 'share_image', 'display_order', 'catalogue_page', 'updated_at']

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContent
        fields = ['brand_name', 'tagline', 'headline', 'company_name', 'address', 'email', 'website', 'story', 'phone', 'instagram_url', 'facebook_url', 'contact_heading', 'contact_intro', 'footer_note', 'seo_title', 'seo_description', 'privacy_notice', 'updated_at']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'updated_at']

class EnquirySerializer(serializers.ModelSerializer):
    product = serializers.SlugRelatedField(slug_field='slug', queryset=Product.objects.filter(active=True), required=False, allow_null=True)
    website = serializers.CharField(required=False, allow_blank=True, write_only=True, max_length=300)
    class Meta:
        model = Enquiry
        fields = ['name', 'company', 'email', 'phone', 'subject', 'enquiry_type', 'product', 'message', 'website']
    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Please include at least 10 characters.')
        return value.strip()
    def validate_phone(self, value):
        import re
        if value and not re.fullmatch(r'[+0-9 ()\-]{6,40}', value):
            raise serializers.ValidationError('Enter a valid phone number.')
        return value
    def create(self, validated_data):
        validated_data.pop('website', None)
        return super().create(validated_data)
