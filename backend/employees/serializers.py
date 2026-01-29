from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'other_names',
            'first_surname',
            'second_surname',
            'employment_country',
            'id_type',
            'id_number',
            'email',
            'hire_date',
            'department',
            'status',
            'created_at',
            'updated_at',
        ]

        # Evitar la alteración de los siguientes campos
        read_only_fields = ['id', 'email', 'status', 'created_at', 'updated_at']