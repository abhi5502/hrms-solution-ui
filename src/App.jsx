import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Header } from "./components/shared/header/Header";
import { Footer } from "./components/shared/footer/Footer";
import { Sidebar } from "./components/shared/sidebar/Sidebar";
import { RouteHandler } from "./components/shared/RouteHandler";

import React from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem("token"));
  const isLoginPage = window.location.pathname === "/login";
  const showLayout = isLoggedIn && !isLoginPage;

  React.useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Listen for login in-app (not just storage event)
  React.useEffect(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (key === "token") {
        setIsLoggedIn(!!value);
      }
    };
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true
      }}
    >
      <div className="App">
        {showLayout && <Header />}
        <div className="app-body">
          {showLayout && <Sidebar />}
          <div className="main-content">
            <RouteHandler />
          </div>
        </div>
        {showLayout && <Footer />}
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
    </Router>
  );
}

export default App;