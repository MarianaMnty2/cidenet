import { useEffect, useState } from "react";
import './App.css'

function App() {
  // Creación de estados
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    first_name: "",
    other_names: "",
    first_surname: "",
    second_surname: "",
    id_type: "",
    id_number: "",
    employment_country: "",
    email: "",
  });

  // Estados del formulario 
  const [formData, setFormData] = useState({
    first_name: "",
    other_names: "",
    first_surname: "",
    second_surname: "",
    id_type: "CC",
    id_number: "",
    employment_country: "CO", 
    hire_date: "",
    department: "OPE", 
  });

  // Gestión del estado de cargas y errores
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/employees/");
      if (!res.ok) throw new Error("Error al cargar empleados");
      const data = await res.json();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Manejador de eventos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Envio de datos al backend (unificado POST/PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEditing 
      ? `http://127.0.0.1:8000/api/employees/${editingId}/`
      : "http://127.0.0.1:8000/api/employees/";

    const method = isEditing ? "PUT" : "POST";

    try {
      setLoading(true);

      const token = localStorage.getItem('access_token'); // si se usa JWT
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedOrNew = await res.json();
        if (isEditing) {
          setEmployees(prev =>
            prev.map(emp => emp.id === editingId ? updatedOrNew : emp)
          );
        } else {
          setEmployees(prev => [...prev, updatedOrNew]);
        }
        setFormData({
          first_name: "",
          other_names: "",
          first_surname: "",
          second_surname: "",
          id_type: "CC",
          id_number: "",
          employment_country: "CO",
          hire_date: "",
          department: "OPE",
        });
        setShowForm(false);
        setIsEditing(false);
        setEditingId(null);
        setError(null);
        alert(isEditing ? "¡Empleado actualizado con éxito!" : "¡Empleado creado con éxito!");
        return;
      }

      const errorData = await res.json().catch(() => null);
      console.log("Respuesta de error del backend:", errorData);

      let mensajeError = isEditing ? "Error al actualizar el empleado" : "Error al crear el empleado";

      if (errorData) {
        if (errorData.detail) {
          mensajeError += `: ${errorData.detail}`;
        } else if (errorData.non_field_errors) {
          mensajeError += `: ${errorData.non_field_errors.join(', ')}`;
        } else if (typeof errorData === 'object') {
          const primerosErrores = Object.entries(errorData)
            .map(([campo, errs]) => `${campo}: ${errs.join(', ')}`)
            .slice(0, 3)
            .join('\n');
          mensajeError += `:\n${primerosErrores || 'Revisa los campos'}`;
        } else {
          mensajeError += ': respuesta inesperada';
        }
      }

      setError(mensajeError);
      alert(mensajeError);
    } catch (err) {
      console.error("Error de red o parsing:", err);
      alert("Error de conexión con el servidor: " + (err.message || err));
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Datos para editar 
  const handleEdit = (employee) => {
    setFormData({
      first_name: employee.first_name || "",
      first_surname: employee.first_surname || "",
      second_surname: employee.second_surname || "",
      other_names: employee.other_names || "",
      employment_country: employee.employment_country || "CO",
      id_type: employee.id_type || "CC",
      id_number: employee.id_number || "",
      hire_date: employee.hire_date 
        ? employee.hire_date.split('T')[0]  // convertimos a YYYY-MM-DD para input date
        : "",
      department: employee.department || "OPE",
    });

    setEditingId(employee.id);
    setIsEditing(true);
    setShowForm(true);
  };

  // Eliminar empleado
  const handleDelete = async (id) => {
    if (!window.confirm("¿Confirma eliminar este empleado?")) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://127.0.0.1:8000/api/employees/${id}/`, {
        method: 'DELETE',
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
      });

      if (res.status === 204 || res.ok) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        setError(null);
        alert('Empleado eliminado');
      } else {
        const errorData = await res.json().catch(() => null);
        console.error('Error al eliminar:', errorData);
        alert('Error al eliminar: ' + (errorData?.detail || JSON.stringify(errorData)));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión: ' + (err.message || err));
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Lista filtrada (computada)
  const filteredEmployees = employees.filter(emp => {
    return (
      (!filters.first_name || 
        emp.first_name.toLowerCase().includes(filters.first_name.toLowerCase())) &&
      (!filters.other_names || 
        (emp.other_names || "").toLowerCase().includes(filters.other_names.toLowerCase())) &&
      (!filters.first_surname || 
        emp.first_surname.toLowerCase().includes(filters.first_surname.toLowerCase())) &&
      (!filters.second_surname || 
        (emp.second_surname || "").toLowerCase().includes(filters.second_surname.toLowerCase())) &&
      (!filters.id_type || 
        emp.id_type === filters.id_type) &&
      (!filters.id_number || 
        emp.id_number.includes(filters.id_number)) &&
      (!filters.employment_country || 
        emp.employment_country === filters.employment_country) &&
      (!filters.email || 
        emp.email.toLowerCase().includes(filters.email.toLowerCase()))
    );
  });

  return (
    <div className="container">
      <h1>Empleados</h1>

      <button
        className={`btn ${showForm ? 'btn-cancel' : 'btn-new'}`}
        onClick={() => {
          if (showForm) {
            setShowForm(false);
            setIsEditing(false);
            setEditingId(null);
            setFormData({
              first_name: "",
              other_names: "",
              first_surname: "",
              second_surname: "",
              id_type: "CC",
              id_number: "",
              employment_country: "CO",
              hire_date: "",
              department: "OPE",
            });
          } else {
            setShowForm(true);
            setIsEditing(false);
            setEditingId(null);
            setFormData({
              first_name: "",
              other_names: "",
              first_surname: "",
              second_surname: "",
              id_type: "CC",
              id_number: "",
              employment_country: "CO",
              hire_date: "",
              department: "OPE",
            });
          }
        }}
      >
        {showForm ? "Cancelar" : "+ Nuevo Empleado"}
      </button>

      {/* Sección de filtros */}
      <div className="filters-container" style={{ margin: "20px 0" }}>
        <h3>Filtros</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Primer Nombre</label>
            <input
              type="text"
              value={filters.first_name}
              onChange={(e) => setFilters(prev => ({ ...prev, first_name: e.target.value }))}
              placeholder="Buscar por primer nombre"
            />
          </div>

          <div className="form-group">
            <label>Otros Nombres</label>
            <input
              type="text"
              value={filters.other_names}
              onChange={(e) => setFilters(prev => ({ ...prev, other_names: e.target.value }))}
              placeholder="Buscar por otros nombres"
            />
          </div>

          <div className="form-group">
            <label>Primer Apellido</label>
            <input
              type="text"
              value={filters.first_surname}
              onChange={(e) => setFilters(prev => ({ ...prev, first_surname: e.target.value }))}
              placeholder="Buscar por primer apellido"
            />
          </div>

          <div className="form-group">
            <label>Segundo Apellido</label>
            <input
              type="text"
              value={filters.second_surname}
              onChange={(e) => setFilters(prev => ({ ...prev, second_surname: e.target.value }))}
              placeholder="Buscar por segundo apellido"
            />
          </div>

          <div className="form-group">
            <label>Tipo Identificación</label>
            <select
              value={filters.id_type}
              onChange={(e) => setFilters(prev => ({ ...prev, id_type: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PA">Pasaporte</option>
              <option value="PE">Permiso Especial</option>
            </select>
          </div>

          <div className="form-group">
            <label>Número Identificación</label>
            <input
              type="text"
              value={filters.id_number}
              onChange={(e) => setFilters(prev => ({ ...prev, id_number: e.target.value }))}
              placeholder="Buscar por número ID"
            />
          </div>

          <div className="form-group">
            <label>País</label>
            <select
              value={filters.employment_country}
              onChange={(e) => setFilters(prev => ({ ...prev, employment_country: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="CO">Colombia</option>
              <option value="US">Estados Unidos</option>
            </select>
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="text"
              value={filters.email}
              onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Buscar por email"
            />
          </div>
        </div>

        <button
          onClick={() => setFilters({
            first_name: "",
            other_names: "",
            first_surname: "",
            second_surname: "",
            id_type: "",
            id_number: "",
            employment_country: "",
            email: "",
          })}
          style={{ marginTop: "10px", padding: "8px 16px" }}
        >
          Limpiar filtros
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{isEditing ? "Editar Empleado" : "Nuevo Empleado"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Primer Nombre *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  maxLength={20}
                  pattern="[A-Z ]+"
                  title="Solo letras mayúsculas"
                />
              </div>

              <div className="form-group">
                <label>Otros Nombres</label>
                <input
                  type="text"
                  name="other_names"
                  value={formData.other_names}
                  onChange={handleInputChange}
                  maxLength={50}
                  pattern="[A-Z ]*"
                />
              </div>

              <div className="form-group">
                <label>Primer Apellido *</label>
                <input
                  type="text"
                  name="first_surname"
                  value={formData.first_surname}
                  onChange={handleInputChange}
                  required
                  maxLength={20}
                  pattern="[A-Z]+"
                  title="Solo letras mayúsculas, sin espacios ni ñ"
                />
              </div>

              <div className="form-group">
                <label>Segundo Apellido *</label>
                <input
                  type="text"
                  name="second_surname"
                  value={formData.second_surname}
                  onChange={handleInputChange}
                  required
                  maxLength={20}
                  pattern="[A-Z]+"
                />
              </div>
              
              <div className="form-group">
                <label>País del empleo *</label>
                <select
                  name="employment_country"
                  value={formData.employment_country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="CO">Colombia</option>
                  <option value="US">Estados Unidos</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de Identificación *</label>
                <select
                  name="id_type"
                  value={formData.id_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                  <option value="PE">Permiso Especial</option>
                </select>
              </div>

              <div className="form-group">
                <label>Número de Identificación *</label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleInputChange}
                  required
                  maxLength={20}
                  pattern="[a-zA-Z0-9-]+"
                  title="Solo letras, números y guion (-)"
                />
              </div>

              <div className="form-group">
                <label>Fecha de ingreso *</label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Área *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ADM">Administración</option>
                  <option value="FIN">Financiera</option>
                  <option value="COM">Compras</option>
                  <option value="INF">Infraestructura</option>
                  <option value="OPE">Operación</option>
                  <option value="TH">Talento Humano</option>
                  <option value="SV">Servicios Varios</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Email generado (automático)</label>
              <input
                type="text"
                value="Se generará al guardar"
                readOnly
                disabled
                style={{ backgroundColor: "#f0f0f0", color: "#666" }}
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <button type="submit" className="btn-save">
                Guardar Empleado
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <div className="loading">Cargando empleados...</div>}
      {error && <div className="error">Error: {error}</div>}

      <ul className="employee-list">
        {filteredEmployees.map((emp) => (
          <li key={emp.id} className="employee-item">
            <span className="employee-name">
              {emp.first_name} {emp.other_names} {emp.first_surname} 
              {emp.second_surname && ` ${emp.second_surname}`}
            </span>
            <br />
            <span className="employee-email">{emp.email}</span>
            <div>
              <button
                className="btn btn-edit"
                onClick={() => handleEdit(emp)}
              >
                Editar
              </button>
              <button
                className="btn btn-delete"
                onClick={() => handleDelete(emp.id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {filteredEmployees.length === 0 && employees.length > 0 && (
        <p style={{ color: "#666", marginTop: "20px", textAlign: "center" }}>
          No se encontraron empleados con los filtros aplicados.
        </p>
      )}
    </div>
  );
}

export default App;