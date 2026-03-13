"""
HRMS Lite – Employee Serializers

Handles serialization, deserialization, and validation of Employee data.
Server-side validation rules:
  - All fields required on create
  - employee_id must be unique (case-insensitive normalised)
  - email must be valid and unique
  - department must be one of the predefined choices
"""

from rest_framework import serializers
from .models import Employee, Department


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Full employee serializer used for list, create, and detail endpoints.
    """

    # Expose the human-readable department label alongside the value
    department_display = serializers.CharField(
        source='get_department_display',
        read_only=True,
    )

    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_id',
            'full_name',
            'email',
            'department',
            'department_display',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'department_display']

    # ------------------------------------------------------------------
    # Field-level validation
    # ------------------------------------------------------------------

    def validate_employee_id(self, value):
        """Normalize to uppercase and check uniqueness."""
        value = value.strip().upper()
        qs = Employee.objects.filter(employee_id__iexact=value)
        # On update, exclude the current instance
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f'Employee ID "{value}" is already in use.'
            )
        return value

    def validate_email(self, value):
        """Normalize email to lowercase and check uniqueness."""
        value = value.strip().lower()
        qs = Employee.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                'An employee with this email address already exists.'
            )
        return value

    def validate_department(self, value):
        """Ensure department is one of the accepted choices."""
        valid = [choice[0] for choice in Department.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f'"{value}" is not a valid department. '
                f'Choose from: {", ".join(valid)}.'
            )
        return value

    def validate_full_name(self, value):
        """Trim whitespace and ensure minimum length."""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError(
                'Full name must be at least 2 characters.'
            )
        return value


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views (omits heavy fields).
    """
    department_display = serializers.CharField(
        source='get_department_display',
        read_only=True,
    )

    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_id',
            'full_name',
            'email',
            'department',
            'department_display',
            'created_at',
        ]
