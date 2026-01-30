import { useRef, useEffect } from "react";
import "./EmployeeFilters.css";

export default function EmployeeFilters({ filters = {}, setFilters, onClear, onClose }) {
  const filtersRef = useRef(null);

  // Cerrar filtros al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target)
      ) {
        onClose && onClose();
      }
    };

    const handleKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="filters-wrapper" ref={filtersRef}>
      <div className={`filters-dropdown open`}>
        <button className="btn-close" aria-label="Cerrar filtros" onClick={() => onClose && onClose()}>×</button>
        <div className="filters-list">
          <div className="filter-row">
            <label>Primer Nombre</label>
            <input value={filters.first_name || ''} onChange={(e) => handleChange('first_name', e.target.value)} placeholder="Primer Nombre" />
          </div>

          <div className="filter-row">
            <label>Primer Apellido</label>
            <input value={filters.first_surname || ''} onChange={(e) => handleChange('first_surname', e.target.value)} placeholder="Primer Apellido" />
          </div>

          <div className="filter-row">
            <label>Tipo de Identificación</label>
            <select value={filters.id_type || ''} onChange={(e) => handleChange('id_type', e.target.value)}>
                <option value="">Todos</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
                <option value="PE">Permiso Especial</option>
            </select>
          </div>

          <div className="filter-row">
            <label>Número de Identificación</label>
            <input value={filters.id_number || ''} onChange={(e) => handleChange('id_number', e.target.value)} placeholder="Identificación" />
          </div>

          <div className="filter-row">
            <label>País</label>
            <select value={filters.employment_country || ''} onChange={(e) => handleChange('employment_country', e.target.value)}>
              <option value="">Todos</option>
              <option value="CO">Colombia</option>
              <option value="US">Estados Unidos</option>
            </select>
          </div>

          <div className="filter-row">
            <label>Correo Electrónico</label>
            <input value={filters.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="Correo Electrónico" />
          </div>

        </div>

        <div className="filters-actions">
          <button className="btn-clear" onClick={() => { onClear && onClear(); onClose && onClose(); }}>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}



