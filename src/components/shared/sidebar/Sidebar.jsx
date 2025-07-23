import "./Sidebar.css"; // Import the CSS for the sidebar
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <nav>
        <div className="nav-section">
          <h4>MAIN</h4>
          <ul>
            <li>
              <Link
                to="/dashboard"
                className={
                  location.pathname === "/dashboard" ||
                  location.pathname === "/"
                    ? "active"
                    : ""
                }
              >
                📊 Dashboards
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <h4>WEB APPS</h4>
          <ul>
            <li>
              <Link
                to="/employees"
                className={location.pathname === "/employees" ? "active" : ""}
              >
                👥 Employees
              </Link>
            </li>

            <li>
              <Link
                to="/users"
                className={location.pathname === "/users" ? "active" : ""}
              >
                👤 Users
              </Link>
            </li>

           
            <li>
              <Link
                to="/roles"
                className={location.pathname === "/roles" ? "active" : ""}
              >
                🔐 Roles
              </Link>
            </li>

            <li>
              <Link
                to="/permissions"
                className={location.pathname === "/permissions" ? "active" : ""}
              >
                🔑 Permissions
              </Link>
            </li>

            <li>
              <Link
                to="/modules"
                className={location.pathname === "/modules" ? "active" : ""}
              >
                📦 Modules
              </Link>
            </li>


            <li>
              <Link
                to="/company"
                className={location.pathname === "/company" ? "active" : ""}
              >
                🏭 Company
              </Link>
            </li>
            <li>
              <Link
                to="/countries"
                className={location.pathname === "/countries" ? "active" : ""}
              >
                🌍 Countries
              </Link>
            </li>

            <li>
              <Link
                to="/states"
                className={location.pathname === "/states" ? "active" : ""}
              >
                🗺️ States
              </Link>
            </li>

            <li>
              <Link
                to="/cities"
                className={location.pathname === "/cities" ? "active" : ""}
              >
                🏙️ Cities
              </Link>
            </li>

            <li>
              <Link
                to="/departments"
                className={location.pathname === "/departments" ? "active" : ""}
              >
                🏢 Departments
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <h4>SYSTEM</h4>
          <ul>
            <li>
              <Link
                to="/settings"
                className={location.pathname === "/settings" ? "active" : ""}
              >
                ⚙️ Settings
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};
