import React from "react";
import { useRoutes, useLocation, Navigate } from "react-router-dom";
import { Dashboard } from "../Dashboard/Dashboard";
import { Employee } from "../Employee/employee";
import { User } from "../User/user";
import { Role } from "../Role/role";
import { Permission } from "../Permission/permission";
import { Module } from "../Module/module";
import { Country } from "../Country/country";
import { State } from "../State/state";
import { City } from "../City/city";
import Login from "./Login/Login";


export const RouteHandler = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  const routes = useRoutes([
    {
      path: "/login",
      element: <Login />,
    },
    ...(!isLoggedIn
      ? [
          {
            path: "*",
            element: <Navigate to="/login" replace />,
          },
        ]
      : [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
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
            path: "/permissions",
            element: <Permission />,
          },
          {
            path: "/modules",
            element: <Module />,
          },
          {
            path: "/countries",
            element: <Country />,
          },
          {
            path: "/states",
            element: <State />,
          },
          {
            path: "/cities",
            element: <City />,
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
        ]),
  ]);

  return routes;
};
