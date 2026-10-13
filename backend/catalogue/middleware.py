from django.http import HttpResponse
from .services import client_identity, rate_allowed

class AdminLoginRateLimit:
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        if request.path == '/admin/login/' and request.method == 'POST':
            if not rate_allowed(client_identity(request), 'admin-login', 15, 900):
                response = HttpResponse('Too many login attempts. Please try again in 15 minutes.', status=429)
                response['Retry-After'] = '900'
                return response
        return self.get_response(request)
