from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.utils.crypto import constant_time_compare
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import FAQ
from .serializers import FAQSerializer, EnquirySerializer
from .services import rate_allowed, client_identity, notify_enquiry

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

class FAQList(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FAQSerializer
    queryset = FAQ.objects.filter(active=True)

class EnquiryCreate(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        # Next.js is the only writer. Browser cookies are never forwarded.
        if not settings.ENQUIRY_PROXY_TOKEN or not constant_time_compare(request.headers.get('X-Enquiry-Token', ''), settings.ENQUIRY_PROXY_TOKEN):
            return Response({'detail': 'Submission unavailable.'}, status=403)
        if not rate_allowed(client_identity(request), 'enquiry', settings.ENQUIRY_RATE_LIMIT):
            return Response({'detail': 'Too many enquiries. Please try again later.'}, status=429, headers={'Retry-After':'3600'})
        serializer = EnquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get('website'):
            return Response({'detail': 'Thank you. Your enquiry has been received.'}, status=201)
        enquiry = serializer.save()
        # Autocommit stores the message before touching SMTP.
        notify_enquiry(enquiry)
        return Response({'detail': 'Thank you. Your enquiry has been received.'}, status=201)

def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        return JsonResponse({'status':'ok'})
    except Exception:
        return JsonResponse({'status':'unavailable'}, status=503)
