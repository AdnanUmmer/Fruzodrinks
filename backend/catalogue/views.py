from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from .models import Product, SiteContent
from .serializers import ProductSerializer, SiteSerializer

class ProductList(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(active=True).prefetch_related('assets')

class ProductDetail(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(active=True).prefetch_related('assets')
    lookup_field = 'slug'

class SiteDetail(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = SiteSerializer
    def get_object(self):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(SiteContent, pk=1)
