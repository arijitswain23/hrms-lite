"""
HRMS Lite – Attendance Serializers

Validation rules:
  - employee must exist
  - date is required and cannot be in the future (optional, relaxed here)
  - status must be Present or Absent
  - duplicate (employee, date) raises a validation error
"""

from rest_framework import serializers
from .models import Attendance, AttendanceStatus
from apps.employees.serializers import EmployeeListSerializer


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Full attendance serializer.
    On read: includes nested employee details.
    On write: accepts employee id (integer FK).
    """

    # Nested read-only employee detail
    employee_detail = EmployeeListSerializer(source='employee', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id',
            'employee',          # write: FK id
            'employee_detail',   # read: nested object
            'date',
            'status',
            'note',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'employee_detail', 'created_at', 'updated_at']

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def validate_status(self, value):
        valid = [choice[0] for choice in AttendanceStatus.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f'Status must be one of: {", ".join(valid)}.'
            )
        return value

    def validate(self, attrs):
        """
        Cross-field validation: ensure no duplicate (employee, date) record
        exists, excluding the current instance on updates.
        """
        employee = attrs.get('employee', getattr(self.instance, 'employee', None))
        date = attrs.get('date', getattr(self.instance, 'date', None))

        qs = Attendance.objects.filter(employee=employee, date=date)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                f'Attendance for {employee.full_name} on {date} already exists. '
                'Use the update endpoint to modify it.'
            )
        return attrs


class AttendanceSummarySerializer(serializers.Serializer):
    """
    Read-only serializer for per-employee attendance summary statistics.
    Used by the summary endpoint.
    """
    employee_id   = serializers.CharField()
    full_name     = serializers.CharField()
    department    = serializers.CharField()
    total_days    = serializers.IntegerField()
    present_days  = serializers.IntegerField()
    absent_days   = serializers.IntegerField()
    attendance_pct = serializers.FloatField()
