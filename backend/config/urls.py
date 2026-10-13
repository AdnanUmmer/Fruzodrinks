from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from catalogue.views import ProductList, ProductDetail, SiteDetail, FAQList, EnquiryCreate, health

urlpatterns = [path('admin/', admin.site.urls),
    path('api/products/', ProductList.as_view()),
    path('api/products/<slug:slug>/', ProductDetail.as_view()),
    path('api/site/', SiteDetail.as_view()),
    path('api/faqs/', FAQList.as_view()),
    path('api/enquiries/', EnquiryCreate.as_view()),
    path('health/', health)]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
