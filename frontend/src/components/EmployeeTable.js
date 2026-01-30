import './EmployeeTable.css';

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Área</th>
            <th>Identificación</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{`${emp.first_name} ${emp.other_names} ${emp.first_surname} ${emp.second_surname}`}</td>
              <td>{`${emp.department}`}</td>
              <td>{`${emp.id_type} ${emp.id_number}`}</td>
              <td>{emp.email}</td>
              <td className="status-active">Activo</td>
              <td className="actions-cell">
                <button className="btn-edit" onClick={() => onEdit(emp)}>Editar</button>
                <button className="btn-delete" onClick={() => onDelete(emp.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}