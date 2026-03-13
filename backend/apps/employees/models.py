"""
HRMS Lite – Employee Model

Represents a single employee in the system.
Fields are intentionally kept minimal per assignment scope.
"""

from django.db import models
from django.core.validators import EmailValidator


class Department(models.TextChoices):
    """Predefined department options (expandable in future)."""
    ENGINEERING      = 'Engineering',      'Engineering'
    HUMAN_RESOURCES  = 'Human Resources',  'Human Resources'
    FINANCE          = 'Finance',          'Finance'
    MARKETING        = 'Marketing',        'Marketing'
    SALES            = 'Sales',            'Sales'
    OPERATIONS       = 'Operations',       'Operations'
    PRODUCT          = 'Product',          'Product'
    DESIGN           = 'Design',           'Design'
    LEGAL            = 'Legal',            'Legal'
    CUSTOMER_SUCCESS = 'Customer Success', 'Customer Success'


class Employee(models.Model):
    """
    Core employee record.

    employee_id — HR-assigned identifier (e.g. EMP001). Must be unique.
    full_name   — Employee's display name.
    email       — Corporate email, must be unique and valid.
    department  — Organisational unit.
    created_at  — Timestamp of record creation (auto).
    updated_at  — Timestamp of last modification (auto).
    """

    employee_id = models.CharField(
        max_length=20,
        unique=True,
        help_text='Unique HR identifier, e.g. EMP001',
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator(message='Enter a valid email address.')],
    )
    department = models.CharField(
        max_length=50,
        choices=Department.choices,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employees'
        ordering = ['full_name']
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'

    def __str__(self):
        return f'{self.employee_id} – {self.full_name}'
