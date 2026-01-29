from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import re

class Employee(models.Model):
    first_surname = models.CharField(max_length=20)
    second_surname = models.CharField(max_length=20)
    first_name = models.CharField(max_length=20)
    other_names = models.CharField(max_length=50, blank=True)

    COUNTRIES_CHOICES = [('CO', 'Colombia'), ('US', 'Estados Unidos')]
    employment_country = models.CharField(max_length=2, choices=COUNTRIES_CHOICES)

    ID_TYPE_CHOICES = [
        ('CC', 'Cédula de Ciudadania'),
        ('CE', 'Cédula de Extranjería'),
        ('PA', 'Pasaporte'),
        ('PE', 'Permiso Especial'),
    ]

    id_type = models.CharField(max_length=2, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=20)

    email = models.CharField(max_length=300, unique=True, editable=False)

    # Fecha de contratación (max today, min today - 31 días)
    hire_date = models.DateField()

    DEPARTMENT_CHOICES = [
        ('ADM', 'Administración'),
        ('FIN', 'Financiera'),
        ('COM', 'Compras'),
        ('INF', 'Infraestructura'),
        ('OPE', 'Operación'),
        ('TH', 'Talento Humano'),
        ('SV', 'Servicios Varios'),
    ]
    department = models.CharField(max_length=3, choices=DEPARTMENT_CHOICES)

    status = models.CharField(max_length=20, default='Activo', editable=False)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(null=True, blank=True, editable=False)
    
    class Meta:
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        unique_together = ['id_type', 'id_number']
        ordering = ['first_surname', 'first_name']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['first_name', 'first_surname']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.first_surname} - {self.email}"
        
    def clean(self):
        self.first_surname = (self.first_surname or '').strip().upper() 
        self.second_surname = (self.second_surname or '').strip().upper() 
        self.first_name = (self.first_name or '').strip().upper() 
        self.other_names = (self.other_names or '').strip().upper() 

        # Se definen los patrones: strict - sin espacios, space - con espacios
        allowed_pattern_strict = r'^[A-Z]+$'
        allowed_pattern_space = r'^[A-Z\s]+$'

        for field, value, allow_space in [
            ('first_surname', self.first_surname, True),
            ('second_surname', self.second_surname, True),
            ('first_name', self.first_name, False),
            ('other_names', self.other_names, True),
        ]:
            pattern = allowed_pattern_space if allow_space else allowed_pattern_strict
            if value and not re.match(pattern, value):
                raise ValidationError(
                    f"{field.replace('_', ' ').title()}: solo se permiten letras A-Z en mayúsculas"
                    f"{'(se permiten espacios)' if allow_space else '(sin espacios)'}."
                )
            
        # Campos obligatorios
        if not self.first_surname or not self.second_surname or not self.first_name:
            raise ValidationError("Apellido y nombre son obligatorios.")
        
        # Validación de fecha de contratación
        today = timezone.now().date()
        if self.hire_date > today:
            raise ValidationError("La fecha no puede ser futura.")
        if self.hire_date < (today - timezone.timedelta(days=31)):
            raise ValidationError("La fecha no puede ser anterior a 31 días.")
    
    # Controla que funciona al momento de crear o editar
    def save(self, *args, **kwargs):
        if not self.pk:
            self.created_at = timezone.now()
        else:
            self.updated_at = timezone.now()

        self.full_clean()

        # Generar email solo si es un nuevo registro
        if not self.pk:
            domain = "cidenet.com.co" if self.employment_country == "CO" else "cidenet.com.us"

            first_name_lower = self.first_name.lower().strip()
            first_surname_lower = self.first_surname.lower().strip()

            # Manejo de apellidos compuestos 
            first_surname_normalized = first_surname_lower.replace(" ", "")

            base_email = f"{first_name_lower}.{first_surname_normalized}@{domain}" 

            # Verifica si el email base esta disponible
            if not Employee.objects.filter(email=base_email).exists():
                self.email = base_email
            else:
                # Busca el siguiente número disponible
                counter = 1
                while True:
                    email_counter = f"{first_name_lower}.{first_surname_normalized}.{counter}@{domain}"
                    if not Employee.objects.filter(email=email_counter).exclude(pk=self.pk).exists():
                        self.email = email_counter
                        break
                    counter += 1

                    # Validación contra loops
                    if counter > 100000:
                        raise ValidationError("No se pudo generar un email único")
            
        super().save(*args, **kwargs)

