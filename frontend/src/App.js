import { useEffect, useState } from "react";
import * as api from "./services/api";
import EmployeeFilters from "./components/EmployeeFilters";
import EmployeeTable from "./components/EmployeeTable";
import EmployeeForm from "./components/EmployeeForm";
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ first_name: "", first_surname: "", id_number: "", id_type: "", employment_country: "", email: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // 10 empleados por página
  const [formData, setFormData] = useState({ first_name: "", first_surname: "", id_type: "CC", id_number: "", employment_country: "CO", hire_date: "", department: "OPE" });

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateEmployee(editingId, formData);
      } else {
        await api.createEmployee(formData);
      }
      loadEmployees();
      setShowForm(false);
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar empleado?")) {
      await api.deleteEmployee(id);
      loadEmployees();
    }
  };

  const handleClearFilters = () => {
    setFilters({ first_name: "", first_surname: "", id_number: "", id_type: "", employment_country: "", email: "" });
    setCurrentPage(1);
  };

  // Resetea la página cuando se selecciona un filtro
  useEffect(() => { setCurrentPage(1); }, [filters]);

  // Lista de filtros
  const filteredEmployees = employees.filter(emp => {
    return (
      (!filters.first_name || (emp.first_name || '').toLowerCase().includes(filters.first_name.toLowerCase())) &&
      (!filters.first_surname || (emp.first_surname || '').toLowerCase().includes(filters.first_surname.toLowerCase())) &&
      (!filters.id_number || (emp.id_number || '').includes(filters.id_number)) &&
      (!filters.id_type || (emp.id_type || '').toLowerCase() === filters.id_type.toLowerCase()) &&
      (!filters.employment_country || (emp.employment_country || '').toLowerCase() === filters.employment_country.toLowerCase()) &&
      (!filters.email || (emp.email || '').toLowerCase().includes(filters.email.toLowerCase()))
    );
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));

  // Ensure current page is reset if it goes out of range after filtering
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [currentPage, totalPages]);

  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="app-container">
      <div className="brand">
        <img src="/icon%20cidenet(1).png" alt="logo" className="brand-icon" />
        <h1 className="brand-title">Gestión de Empleados</h1>
      </div>

      <div className="header-actions">
        <div className="filters-wrapper">
          <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "ocultar Filtros" : "Mostrar Filtros"} 🔍
          </button>

          {showFilters && (
            <EmployeeFilters 
              filters={filters} 
              setFilters={setFilters} 
              onClear={handleClearFilters} 
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        <button className="btn btn-primary btn-add" onClick={() => { setIsEditing(false); setShowForm(true); }}>
          <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="#fff" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>
          <span>Nuevo Empleado</span>
        </button>
      </div>

      {showForm && (
        <EmployeeForm 
          formData={formData} 
          setFormData={setFormData} 
          onSubmit={handleSave} 
          onCancel={() => setShowForm(false)} 
          isEditing={isEditing} 
        />
      )}

      <EmployeeTable 
        employees={paginatedEmployees}
        onEdit={(emp) => { setFormData(emp); setEditingId(emp.id); setIsEditing(true); setShowForm(true); }}
        onDelete={handleDelete}
      />

      {/* Controles de paginación */}
      <div className="pagination-container">
        <div className="pagination-info">Página {currentPage} de {totalPages} — {filteredEmployees.length} empleados</div>
        <div className="pagination-controls">
          <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}>Prev</button>

          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i}
              className={`pagination-number ${currentPage === i+1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i+1)}
            >{i+1}</button>
          ))}

          <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default App;