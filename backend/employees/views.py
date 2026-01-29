from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee
from .serializers import EmployeeSerializer
from .pagination import EmployeePagination

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    permission_classes = [IsAuthenticatedOrReadOnly] # Para usuarios logueados sería IsAuthenticatedOrReadOnly

    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'first_name': ['icontains'],
        'other_names': ['icontains'],
        'first_surname': ['icontains'],
        'second_surname': ['icontains'],
        'id_type': ['exact'],
        'id_number': ['icontains'],
        'employment_country': ['exact'],
        'email': ['icontains'],
        'department': ['exact'],
        'status': ['exact'],
    }

    ordering_fields = [
        'first_surname',
        'first_name',
        'hire_date',
        'created_at',
    ]

    ordering = ['first_surname', 'first_name']

    pagination_class = EmployeePagination