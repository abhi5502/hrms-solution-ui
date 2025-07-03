import React from "react";
import { useLocation } from "react-router-dom";

export const SidebarTest = () => {
  const location = useLocation();

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "yellow",
        padding: "10px",
        zIndex: 9999,
      }}
    >
      <p>Current Path: {location.pathname}</p>
      <p>Sidebar Test Component</p>
    </div>
  );
};
