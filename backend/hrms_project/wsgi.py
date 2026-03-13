"""
HRMS Lite – WSGI Configuration
Used by Gunicorn in production (Railway deployment).
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms_project.settings.base')
application = get_wsgi_application()
