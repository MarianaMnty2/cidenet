from django.urls import path
from .views import employee_list_created, EmployeeDetail

# Asegúrate de que el nombre sea exactamente urlpatterns
urlpatterns = [
    path('', employee_list_created),
    path('<int:pk>/', EmployeeDetail.as_view(), name='employee-detail'),
]