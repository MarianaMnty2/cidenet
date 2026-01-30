import { useEffect, useState } from "react";
import './EmployeeForm.css';

export default function EmployeeForm({ formData, setFormData, onSubmit, onCancel, isEditing }) {
  const [lowercaseWarnings, setLowercaseWarnings] = useState({});
  const nameFields = ['first_name','other_names','first_surname','second_surname'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (nameFields.includes(name)) {
      // Detecta cuando se escribe en minúscula
      const hasLetter = /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(value);
      const hasLowercase = hasLetter && value !== value.toUpperCase();
      setLowercaseWarnings(prev => ({ ...prev, [name]: hasLowercase }));
    }
  };

  useEffect(() => {
    // Evitar scroll en 2do plano
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onCancel && onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onCancel]);

  return (
    <div className="form-overlay" role="dialog" aria-modal="true">
      <div className="form-card">
        <div className="form-header">
          <h3>{isEditing ? "Editar Empleado" : "Nuevo Empleado"}</h3>
          <button className="btn-close" onClick={onCancel} aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Primer Nombre *</label>
              <input name="first_name" value={formData.first_name || ''} onChange={handleChange} required placeholder="Primer Nombre" />
              {lowercaseWarnings.first_name && (
                <div className="field-warning" role="alert" aria-live="polite">Por favor, escriba en <strong>MAYÚSCULAS</strong>.</div>
              )}
            </div>

            <div className="form-group">
              <label>Otros Nombres</label>
              <input name="other_names" value={formData.other_names || ''} onChange={handleChange} placeholder="Otros Nombres" />
              {lowercaseWarnings.other_names && (
                <div className="field-warning" role="alert" aria-live="polite">Por favor, escriba en <strong>MAYÚSCULAS</strong>.</div>
              )}
            </div>

            <div className="form-group">
              <label>Primer Apellido *</label>
              <input name="first_surname" value={formData.first_surname || ''} onChange={handleChange} required placeholder="Primer Apellido" />
              {lowercaseWarnings.first_surname && (
                <div className="field-warning" role="alert" aria-live="polite">Por favor, escriba en <strong>MAYÚSCULAS</strong>.</div>
              )}
            </div>

            <div className="form-group">
              <label>Segundo Apellido</label>
              <input name="second_surname" value={formData.second_surname || ''} onChange={handleChange} placeholder="Segundo Apellido" />
              {lowercaseWarnings.second_surname && (
                <div className="field-warning" role="alert" aria-live="polite">Por favor, escriba en <strong>MAYÚSCULAS</strong>.</div>
              )}
            </div>

            <div className="form-group">
              <label>Tipo Identificación *</label>
              <select name="id_type" value={formData.id_type || ''} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
                <option value="PE">Permiso Especial</option>
              </select>
            </div>

            <div className="form-group">
              <label>Número Identificación *</label>
              <input name="id_number" value={formData.id_number || ''} onChange={handleChange} required placeholder="Número ID" />
            </div>

            <div className="form-group">
              <label>País</label>
              <select name="employment_country" value={formData.employment_country || ''} onChange={handleChange}>
                <option value="">Seleccione...</option>
                <option value="CO">Colombia</option>
                <option value="US">Estados Unidos</option>
              </select>
            </div>

            <div className="form-group">
              <label>Área</label>
              <select name="department" value={formData.department || ''} onChange={handleChange}>
                <option value="">Seleccione...</option>
                <option value="ADM">Administración</option>
                <option value="FIN">Financiera</option>
                <option value="COM">Compras</option>
                <option value="INF">Infraestructura</option>
                <option value="OPE">Operación</option>
                <option value="TH">Talento Humano</option>
                <option value="SV">Servicios Varios</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fecha de ingreso *</label>
              <input type="date" name="hire_date" value={formData.hire_date || ''} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}