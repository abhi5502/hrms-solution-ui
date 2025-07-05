import React from "react";
import { User } from "./user";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Simple test component to verify User component works
const UserTest = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>User Management Test</h1>
      <User />
      <ToastContainer />
    </div>
  );
};

export default UserTest;
