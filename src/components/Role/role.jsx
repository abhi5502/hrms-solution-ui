import React, { useState, useEffect } from "react";
import { RoleFormModal, DeleteConfirmModal, ViewRoleModal } from "./RoleModals";
import "./role.css";

// Skeleton Loading Component
const RolesSkeleton = () => (
  <div className="role-container">
    <div className="page-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-button"></div>
    </div>

    <div className="roles-list">
      <h5>Role-List</h5>
      <div className="table-wrapper">
        <div className="skeleton-table">
          <div className="skeleton-table-header">
            <div>S.No</div>
            <div>Role Name</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`skeleton-${index}`} className="skeleton-row">
              <div className="skeleton-cell serial"></div>
              <div className="skeleton-cell name"></div>
              <div className="skeleton-cell status"></div>
              <div className="skeleton-cell actions"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const Role = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://localhost:7777/gateway/Roles/get-all-role"
      );
      const result = await response.json();

      if (result.success) {
        setRoles(result.data);
      } else {
        setError("Failed to fetch roles");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleAddRole = () => {
    setEditingRole(null);
    setIsRoleFormOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setIsRoleFormOpen(true);
  };

  const handleDeleteRole = (role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleViewRole = (role) => {
    setSelectedRole(role);
    setIsViewModalOpen(true);
  };

  // API handlers
  const handleSaveRole = async (roleData) => {
    try {
      setOperationLoading(true);

      if (editingRole) {
        // Update existing role
        const response = await fetch(
          "https://localhost:7777/gateway/Roles/update-role",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: editingRole.id,
              name: roleData.name,
              description: `${roleData.name} role`,
              status: roleData.status === "Active",
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          console.log("Role updated successfully:", result.data);
          // Refresh the roles list
          await fetchRoles();
        } else {
          setError(result.message || "Failed to update role");
        }
      } else {
        // Add new role
        const response = await fetch(
          "https://localhost:7777/gateway/Roles/create-role",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: roleData.name,
              description: `${roleData.name} role`,
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          console.log("Role created successfully:", result.data);
          // Refresh the roles list
          await fetchRoles();
        } else {
          setError(result.message || "Failed to add role");
        }
      }

      setIsRoleFormOpen(false);
      setEditingRole(null);
    } catch (err) {
      setError("Error saving role");
      console.error("Error saving role:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async (roleId) => {
    try {
      setOperationLoading(true);

      const response = await fetch(
        `https://localhost:7777/gateway/Roles/delete-role/${roleId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (result.success) {
        // Refresh the roles list
        await fetchRoles();
      } else {
        setError("Failed to delete role");
      }

      setIsDeleteModalOpen(false);
      setSelectedRole(null);
    } catch (err) {
      setError("Error deleting role");
      console.error("Error deleting role:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return <RolesSkeleton />;
  }

  if (error) {
    return (
      <div className="role-container">
        <h1>Roles</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="role-container">
      <div className="page-header">
        <h1>Roles</h1>
        <button className="btn-add" onClick={handleAddRole}>
          + Add Role
        </button>
      </div>

      <div className="roles-list">
        <h5>Role-List</h5>
        <div
          className={`table-wrapper ${
            operationLoading ? "table-loading-overlay" : ""
          }`}
        >
          <table className="roles-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Role Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
                <tr key={role.id}>
                  <td className="serial-no">{index + 1}</td>
                  <td className="role-name">{role.name}</td>
                  <td>
                    <span className={`status ${role.status.toLowerCase()}`}>
                      {role.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      title="View Role Details"
                      onClick={() => handleViewRole(role)}
                      disabled={operationLoading}
                    >
                      👁️
                    </button>
                    <button
                      className="btn-edit"
                      title="Edit Role"
                      onClick={() => handleEditRole(role)}
                      disabled={operationLoading}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      title="Delete Role"
                      onClick={() => handleDeleteRole(role)}
                      disabled={operationLoading}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {roles.length === 0 && <div className="no-data">No roles found</div>}
      </div>

      {/* Role Form Modal */}
      <RoleFormModal
        isOpen={isRoleFormOpen}
        onClose={() => {
          setIsRoleFormOpen(false);
          setEditingRole(null);
        }}
        role={editingRole}
        onSave={handleSaveRole}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        onConfirm={handleConfirmDelete}
      />

      {/* View Role Details Modal */}
      <ViewRoleModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
      />
    </div>
  );
};
