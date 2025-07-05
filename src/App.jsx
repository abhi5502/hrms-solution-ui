import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RBACProvider } from "./contexts/RBACContext";
import { Header } from "./components/shared/header/Header";
import { Footer } from "./components/shared/footer/Footer";
import { Sidebar } from "./components/shared/sidebar/Sidebar";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Employee } from "./components/Employee/employee";
import { User } from "./components/User/user";
import { Role } from "./components/Role/role";
import { Permission } from "./components/Permission/permission";
import { Module } from "./components/Module/module";
import ApiTest from "./components/ApiTest";

function App() {
  return (
    <Router>
      <RBACProvider>
        <div className="App">
          <Header />
          <div className="app-body">
            <Sidebar />
            <div className="main-content">
              <Routes>
                <Route path="/employees" element={<Employee />} />
                <Route path="/employee" element={<Employee />} />
                <Route path="/users" element={<User />} />
                <Route path="/roles" element={<Role />} />
                <Route path="/permissions" element={<Permission />} />
                <Route path="/modules" element={<Module />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/api-test" element={<ApiTest />} />
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
          </div>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </RBACProvider>
    </Router>
  );
}

export default App;
