const API_URL = "http://127.0.0.1:8000/api/employees/";

export const getEmployees = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener empleados");
  return res.json();
};

export const createEmployee = async (employeeData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employeeData),
  });
  if (!res.ok) throw new Error("Error al crear empleado");
  return res.json();
};

export const updateEmployee = async (id, employeeData) => {
  const res = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employeeData),
  });
  if (!res.ok) throw new Error("Error al actualizar empleado");
  return res.json();
};

export const deleteEmployee = async (id) => {
  const res = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar empleado");
  return true;
};