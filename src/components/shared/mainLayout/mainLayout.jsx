import "./MainLayout.css"; // Import the CSS for the main layout
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../../Dashboard/Dashboard";
import { Employee } from "../../Employee/employee";
import { User } from "../../User/user";
import { Role } from "../../Role/role";

export const MainLayout = () => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/employees" element={<Employee />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/users" element={<User />} />
        <Route path="/roles" element={<Role />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/departments"
          element={
            <div className="page-content">
              <h1>Departments</h1>
              <p>Departments management page coming soon...</p>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="page-content">
              <h1>Settings</h1>
              <p>System settings page coming soon...</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
};
