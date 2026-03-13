"""
HRMS Lite – Employee URL Patterns
"""

from django.urls import path
from .views import EmployeeListCreateView, EmployeeDetailDeleteView

urlpatterns = [
    # Employee CRUD
    path('', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('<int:pk>/', EmployeeDetailDeleteView.as_view(), name='employee-detail'),


]
