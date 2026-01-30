from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee
from .serializers import EmployeeSerializer
from .pagination import EmployeePagination
from rest_framework.decorators import api_view
from rest_framework.response import Response


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    permission_classes = [AllowAny] # Para usuarios logueados sería IsAuthenticatedOrReadOnly

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


@api_view(['GET', 'POST'])
def employee_list_created(request):
    if request.method == 'GET':
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]  # temporal