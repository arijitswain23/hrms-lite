"""
HRMS Lite – Employee Views

REST endpoints:
  GET    /api/employees/          → list all employees
  POST   /api/employees/          → create employee
  GET    /api/employees/<id>/     → retrieve employee
  DELETE /api/employees/<id>/     → delete employee
  GET    /api/employees/departments/ → list valid departments
"""

from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Employee, Department
from .serializers import EmployeeSerializer, EmployeeListSerializer


class EmployeeListCreateView(generics.ListCreateAPIView):
    """
    GET  – Return paginated list of employees with optional search/filter.
    POST – Create a new employee record.
    """

    queryset = Employee.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department']
    search_fields = ['employee_id', 'full_name', 'email']
    ordering_fields = ['full_name', 'employee_id', 'created_at']
    ordering = ['full_name']

    def get_serializer_class(self):
        """Use lightweight serializer for list, full for create."""
        if self.request.method == 'GET':
            return EmployeeListSerializer
        return EmployeeSerializer

    def create(self, request, *args, **kwargs):
        """Override create to wrap response in success envelope."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        return Response(
            {
                'success': True,
                'message': f'Employee "{employee.full_name}" created successfully.',
                'data': EmployeeSerializer(employee).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        """Override list to wrap in success envelope."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'success': True,
                'data': serializer.data,
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data,
        })


class EmployeeDetailDeleteView(generics.RetrieveDestroyAPIView):
    """
    GET    – Retrieve a single employee by primary key.
    DELETE – Permanently remove an employee and their attendance records.
    """

    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({'success': True, 'data': serializer.data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.full_name
        self.perform_destroy(instance)
        return Response(
            {
                'success': True,
                'message': f'Employee "{name}" and all associated records have been deleted.',
            },
            status=status.HTTP_200_OK,
        )


@api_view(['GET'])
def department_choices(request):
    """
    Return the list of valid department choices.
    Used by the frontend to populate the department dropdown dynamically.
    """
    departments = [
        {'value': choice[0], 'label': choice[1]}
        for choice in Department.choices
    ]
    return Response({'success': True, 'data': departments})
