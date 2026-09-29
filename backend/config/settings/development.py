from .base import *  # noqa: F403

DEBUG = True
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY') or 'development-only-fruzo-change-before-production'
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]', 'testserver']
STORAGES['staticfiles'] = {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}
