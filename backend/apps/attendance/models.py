"""
HRMS Lite – Attendance Model

Tracks daily attendance status for each employee.
One record per employee per date (enforced via unique_together).
"""

from django.db import models
from apps.employees.models import Employee


class AttendanceStatus(models.TextChoices):
    PRESENT = 'Present', 'Present'
    ABSENT  = 'Absent',  'Absent'


class Attendance(models.Model):
    """
    Attendance record.

    employee   — FK to Employee (cascade delete: removing an employee
                 removes all their attendance records).
    date       — Calendar date for this record.
    status     — Present or Absent.
    note       — Optional free-text reason/comment.
    created_at — When the record was first created.
    updated_at — When the record was last modified (e.g., status corrected).
    """

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='attendance_records',
    )
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.PRESENT,
    )
    note = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance'
        # One record per employee per day
        unique_together = [('employee', 'date')]
        ordering = ['-date', 'employee__full_name']
        verbose_name = 'Attendance Record'
        verbose_name_plural = 'Attendance Records'

    def __str__(self):
        return f'{self.employee.employee_id} | {self.date} | {self.status}'
