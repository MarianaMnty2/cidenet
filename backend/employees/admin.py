from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    # Campos que se muestran en la lista de empleados
    list_display = (
        'first_name',
        'other_names',
        'first_surname',
        'second_surname',
        'employment_country',
        'id_type',
        'id_number',
        'email',
        'department',
        'hire_date',
        'status',
        'created_at',
    )

    list_display_links = ('first_name', 'email')

    # Campos por los que se puede buscar
    search_fields = (
        'first_name',
        'first_surname',
        'second_surname',
        'other_names',
        'email',
        'id_number',
    )

    # Filtros 
    list_filter = (
        'employment_country',
        'id_type',
        'department',
        'status',
        'hire_date',
    )

    # Campos que NO se puede editar desde admin
    readonly_fields = (
        'email',
        'status',
        'created_at',
        'updated_at',
    )

    # Orden por defecto
    ordering = ('first_surname', 'first_name', 'created_at')

    # Campos en el formulario de detalle 
    fieldsets = (
        ('Información Personal', {
            'fields': (
                ('first_name', 'other_names'),
                ('first_surname', 'second_surname'),
            )
        }),
        ('Identificación', {
            'fields': (
                ('id_type', 'id_number'),
                'employment_country',
            )
        }),
        ('Detalles del empleo', {
            'fields': (
                'department',
                'hire_date',
                'status',
            )
        }),
        ('Campos del sistema (solo lectura)', {
            'fields': (
                'email',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',), # Se colapsa por defecto
        }),
    )

    # Paginación de 10 por página
    list_per_page = 10

