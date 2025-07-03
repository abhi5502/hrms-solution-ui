import "./Employee.css";

export const Employee = () => {
  return (
    <div className="employee-page">
      <div className="employee-header">
        <h1>Employee Management</h1>
        <button className="add-employee-btn">+ Add Employee</button>
      </div>

      <div className="employee-stats">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <div className="stat-number">245</div>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <div className="stat-number">230</div>
        </div>
        <div className="stat-card">
          <h3>On Leave</h3>
          <div className="stat-number">15</div>
        </div>
      </div>

      <div className="employee-table">
        <div className="table-header">
          <h2>Employee List</h2>
          <div className="table-filters">
            <input type="text" placeholder="Search employees..." />
            <select>
              <option>All Departments</option>
              <option>IT</option>
              <option>HR</option>
              <option>Finance</option>
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EMP001</td>
              <td>John Doe</td>
              <td>IT</td>
              <td>Software Developer</td>
              <td>john.doe@company.com</td>
              <td>
                <span className="status active">Active</span>
              </td>
              <td>
                <button className="btn-edit">Edit</button>
                <button className="btn-delete">Delete</button>
              </td>
            </tr>
            <tr>
              <td>EMP002</td>
              <td>Jane Smith</td>
              <td>HR</td>
              <td>HR Manager</td>
              <td>jane.smith@company.com</td>
              <td>
                <span className="status active">Active</span>
              </td>
              <td>
                <button className="btn-edit">Edit</button>
                <button className="btn-delete">Delete</button>
              </td>
            </tr>
            <tr>
              <td>EMP003</td>
              <td>Mike Johnson</td>
              <td>Finance</td>
              <td>Accountant</td>
              <td>mike.johnson@company.com</td>
              <td>
                <span className="status leave">On Leave</span>
              </td>
              <td>
                <button className="btn-edit">Edit</button>
                <button className="btn-delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
