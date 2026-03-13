"""
HRMS Lite – Attendance Views

Endpoints:
  GET    /api/attendance/                     → list records (filterable)
  POST   /api/attendance/                     → mark attendance
  GET    /api/attendance/<id>/                → retrieve single record
  PUT    /api/attendance/<id>/                → update record
  DELETE /api/attendance/<id>/                → delete record
  GET    /api/attendance/employee/<emp_id>/   → all records for one employee
  GET    /api/attendance/summary/             → per-employee summary stats
"""

from datetime import date as date_type

from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from apps.employees.models import Employee
from .models import Attendance
from .serializers import AttendanceSerializer, AttendanceSummarySerializer


class AttendanceListCreateView(generics.ListCreateAPIView):
    """
    GET  – Paginated, filterable attendance list.
           Query params: employee, date, status, date_from, date_to
    POST – Mark attendance for an employee on a given date.
    """

    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['employee', 'status']
    ordering_fields = ['date', 'employee__full_name']
    ordering = ['-date']

    def get_queryset(self):
        """Support additional date-range filtering via query params."""
        qs = Attendance.objects.select_related('employee').all()

        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        emp_id    = self.request.query_params.get('employee_id')  # string employee_id

        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        if emp_id:
            qs = qs.filter(employee__employee_id__iexact=emp_id)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        return Response(
            {
                'success': True,
                'message': (
                    f'Attendance marked as {record.status} for '
                    f'{record.employee.full_name} on {record.date}.'
                ),
                'data': AttendanceSerializer(record).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'success': True,
                'data': serializer.data,
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'count': queryset.count(), 'data': serializer.data})


class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    – Single attendance record.
    PUT    – Update status / note.
    DELETE – Remove record.
    """

    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    http_method_names = ['get', 'put', 'delete']

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response({'success': True, 'data': self.get_serializer(instance).data})

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        return Response({
            'success': True,
            'message': f'Attendance record updated successfully.',
            'data': AttendanceSerializer(record).data,
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {'success': True, 'message': 'Attendance record deleted.'},
            status=status.HTTP_200_OK,
        )


@api_view(['GET'])
def employee_attendance(request, pk):
    """
    Return all attendance records for a specific employee (by DB primary key).
    Supports ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD query params.
    """
    try:
        employee = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Employee not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    qs = Attendance.objects.filter(employee=employee).order_by('-date')

    date_from = request.query_params.get('date_from')
    date_to   = request.query_params.get('date_to')
    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)

    serializer = AttendanceSerializer(qs, many=True)

    # Basic stats
    total   = qs.count()
    present = qs.filter(status='Present').count()
    absent  = qs.filter(status='Absent').count()

    return Response({
        'success': True,
        'employee': {
            'id': employee.id,
            'employee_id': employee.employee_id,
            'full_name': employee.full_name,
            'department': employee.department,
        },
        'stats': {
            'total_days': total,
            'present_days': present,
            'absent_days': absent,
            'attendance_pct': round((present / total * 100), 1) if total else 0,
        },
        'data': serializer.data,
    })


@api_view(['GET'])
def attendance_summary(request):
    """
    Aggregate attendance summary for all employees.
    Returns present/absent counts and percentage per employee.
    """
    employees = Employee.objects.annotate(
        total_days=Count('attendance_records'),
        present_days=Count('attendance_records', filter=Q(attendance_records__status='Present')),
        absent_days=Count('attendance_records', filter=Q(attendance_records__status='Absent')),
    ).order_by('full_name')

    data = []
    for emp in employees:
        total = emp.total_days
        pct   = round((emp.present_days / total * 100), 1) if total else 0
        data.append({
            'employee_id':     emp.employee_id,
            'full_name':       emp.full_name,
            'department':      emp.department,
            'total_days':      total,
            'present_days':    emp.present_days,
            'absent_days':     emp.absent_days,
            'attendance_pct':  pct,
        })

    return Response({'success': True, 'count': len(data), 'data': data})
