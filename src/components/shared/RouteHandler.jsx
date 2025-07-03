import React from "react";
import { useRoutes, useLocation } from "react-router-dom";
import { Dashboard } from "../Dashboard/Dashboard";
import { Employee } from "../Employee/employee";
import { User } from "../User/user";
import { Role } from "../Role/role";

export const RouteHandler = () => {
  const location = useLocation();
  console.log("RouteHandler rendering, current path:", location.pathname);

  const routes = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/employees",
      element: <Employee />,
    },
    {
      path: "/users",
      element: <User />,
    },
    {
      path: "/roles",
      element: <Role />,
    },
    {
      path: "/departments",
      element: (
        <div className="page-content">
          <h1>Departments</h1>
          <p>Departments management page coming soon...</p>
        </div>
      ),
    },
    {
      path: "/settings",
      element: (
        <div className="page-content">
          <h1>Settings</h1>
          <p>System settings page coming soon...</p>
        </div>
      ),
    },
    {
      path: "*",
      element: (
        <div className="page-content">
          <h1>Page Not Found</h1>
          <p>The requested page could not be found.</p>
          <p>Current path: {location.pathname}</p>
        </div>
      ),
    },
  ]);

  return routes;
};
