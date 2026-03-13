"""
HRMS Lite – Root URL Configuration

All API routes are versioned under /api/.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from apps.employees.views import department_choices

def health_check(request):
    """Simple health-check endpoint for deployment monitoring."""
    return JsonResponse({'status': 'ok', 'service': 'HRMS Lite API'})


urlpatterns = [
    # Admin (internal use)
    path('admin/', admin.site.urls),

    # Health check for Railway / uptime monitoring
    path('health/', health_check, name='health_check'),

    # Versioned API routes
    path('api/employees/', include('apps.employees.urls')),
    path('api/attendance/', include('apps.attendance.urls')),

    # Department reference data
    path('api/departments/', department_choices, name='department-choices'),
]
