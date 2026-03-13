"""
HRMS Lite – Attendance URL Patterns
"""

from django.urls import path
from .views import (
    AttendanceListCreateView,
    AttendanceDetailView,
    employee_attendance,
    attendance_summary,
)

urlpatterns = [
    path('', AttendanceListCreateView.as_view(), name='attendance-list-create'),
    path('<int:pk>/', AttendanceDetailView.as_view(), name='attendance-detail'),
    path('employee/<int:pk>/', employee_attendance, name='employee-attendance'),
    path('summary/', attendance_summary, name='attendance-summary'),
]
