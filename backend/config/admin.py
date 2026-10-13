from django.contrib.admin.apps import AdminConfig

class FruzoAdminConfig(AdminConfig):
    default_site = 'catalogue.admin_site.BrandAdminSite'
