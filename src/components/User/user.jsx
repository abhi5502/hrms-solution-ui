import React, { useState, useEffect } from "react";
import { useRBAC, DEFAULT_MODULES } from "../../contexts/RBACContext";
import {
  UserFormModal,
  RoleManagementModal,
  PermissionManagementModal,
  ModuleManagementModal,
  UserViewModal,
  DeleteConfirmModal,
} from "./UserModals";
import "./User.css";

export const User = () => {
  const {
    getFilteredUsers,
    getUserStats,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserRoles,
    updateUserPermissions,
    updateUserModules,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    ROLES,
    hasPermission,
    PERMISSIONS,
    loading,
    error,
  } = useRBAC();

  // Modal states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Local states for user management
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
  });

  const filteredUsers = getFilteredUsers;

  // Helper function to check if user is admin
  const isAdminUser = (user) => {
    if (!user.roles) return false;
    return user.roles.some((role) => {
      if (typeof role === "string") {
        return role.toLowerCase().includes("admin");
      }
      return false;
    });
  };

  // Load user statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStats = await getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error("Failed to load user stats:", error);
        // Set fallback stats if API fails
        setStats({
          total: filteredUsers.length,
          active: filteredUsers.filter(
            (u) => u.status?.toLowerCase() === "active"
          ).length,
          inactive: filteredUsers.filter(
            (u) => u.status?.toLowerCase() === "inactive"
          ).length,
          admins: filteredUsers.filter(isAdminUser).length,
        });
      }
    };
    loadStats();
  }, [filteredUsers, getUserStats]); // Add dependencies to satisfy React Hook rules

  // Update stats when users change
  useEffect(() => {
    if (filteredUsers.length > 0) {
      setStats({
        total: filteredUsers.length,
        active: filteredUsers.filter(
          (u) => u.status?.toLowerCase() === "active"
        ).length,
        inactive: filteredUsers.filter(
          (u) => u.status?.toLowerCase() === "inactive"
        ).length,
        admins: filteredUsers.filter(isAdminUser).length,
      });
    }
  }, [filteredUsers]); // Depend on the filteredUsers array to avoid missing dependency warning

  // Action handlers with better error handling
  const handleAddUser = () => {
    if (!hasPermission(PERMISSIONS.CREATE)) {
      alert("You do not have permission to create users");
      return;
    }
    setEditingUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user) => {
    if (!hasPermission(PERMISSIONS.UPDATE)) {
      alert("You do not have permission to edit users");
      return;
    }
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    if (!hasPermission(PERMISSIONS.DELETE)) {
      alert("You do not have permission to delete users");
      return;
    }
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleManageRoles = (user) => {
    if (!hasPermission(PERMISSIONS.MANAGE_ROLES)) {
      alert("You do not have permission to manage roles");
      return;
    }
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleManagePermissions = (user) => {
    if (!hasPermission(PERMISSIONS.MANAGE_PERMISSIONS)) {
      alert("You do not have permission to manage permissions");
      return;
    }
    setSelectedUser(user);
    setIsPermissionModalOpen(true);
  };

  const handleManageModules = (user) => {
    if (!hasPermission(PERMISSIONS.MANAGE_MODULES)) {
      alert("You do not have permission to manage modules");
      return;
    }
    setSelectedUser(user);
    setIsModuleModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    if (!hasPermission(PERMISSIONS.UPDATE)) {
      alert("You do not have permission to change user status");
      return;
    }

    try {
      await toggleUserStatus(user.id);
      // Stats will be refreshed automatically due to useEffect
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }
  };

  // Save handlers with API integration
  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await addUser(userData);
      }
      // Close modal on success
      setIsUserFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
      // Don't close modal on error so user can retry
    }
  };

  const handleSaveRoles = async (userId, roles) => {
    try {
      await updateUserRoles(userId, roles);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save roles:", error);
    }
  };

  const handleSavePermissions = async (userId, permissions) => {
    try {
      await updateUserPermissions(userId, permissions);
      setIsPermissionModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save permissions:", error);
    }
  };

  const handleSaveModules = async (userId, modules) => {
    try {
      await updateUserModules(userId, modules);
      setIsModuleModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to save modules:", error);
    }
  };

  const handleConfirmDelete = async (userId) => {
    try {
      await deleteUser(userId);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // Handle errors by re-initializing data
  const handleErrorRefresh = () => {
    // Simple page reload for now
    window.location.reload();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="user-page">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={handleErrorRefresh} className="error-close">
            ×
          </button>
          <button onClick={handleRefresh} className="error-retry">
            Retry
          </button>
        </div>
      )}

      <div className="user-header">
        <h1>User Management</h1>
        <div className="header-actions">
          {hasPermission(PERMISSIONS.CREATE) && (
            <button
              className="add-user-btn"
              onClick={handleAddUser}
              disabled={loading}
            >
              {loading ? "⏳ Loading..." : "+ Add User"}
            </button>
          )}
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Data"
          >
            🔄
          </button>
        </div>
      </div>

      <div className="user-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{loading ? "..." : stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <div className="stat-number">{loading ? "..." : stats.active}</div>
        </div>
        <div className="stat-card">
          <h3>Inactive</h3>
          <div className="stat-number">{loading ? "..." : stats.inactive}</div>
        </div>
        <div className="stat-card">
          <h3>Admins</h3>
          <div className="stat-number">{loading ? "..." : stats.admins}</div>
        </div>
      </div>

      <div className="user-table">
        <div className="table-header">
          <h2>User List</h2>
          <div className="table-filters">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              disabled={loading}
            >
              <option value="">All Roles</option>
              {Object.entries(ROLES).map(([key, role]) => (
                <option key={key} value={key}>
                  {role.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled={loading}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner">⏳ Loading users...</div>
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Permissions</th>
                <th>Modules</th>
                <th>Country</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    {loading ? "Loading..." : "No users found"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.fullName || user.name}</td>
                    <td>
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </td>
                    <td>
                      <div className="roles">
                        {user.roles?.map((roleKey) => (
                          <span
                            key={roleKey}
                            className={`role ${roleKey.toLowerCase()}`}
                            style={{ backgroundColor: ROLES[roleKey]?.color }}
                          >
                            {ROLES[roleKey]?.name || roleKey}
                          </span>
                        )) || <span className="no-data">No roles</span>}
                      </div>
                    </td>
                    <td>
                      <div className="permissions">
                        {(() => {
                          if (user.permissions?.length > 0) {
                            const perms = user.permissions
                              .slice(0, 3)
                              .join(", ");
                            const more =
                              user.permissions.length > 3 ? "..." : "";
                            return perms + more;
                          } else {
                            return "No permissions";
                          }
                        })()}
                      </div>
                    </td>
                    <td>
                      <div className="modules">
                        {user.modules?.map((moduleKey) => {
                          const module = Object.values(DEFAULT_MODULES).find(
                            (m) => m.key === moduleKey
                          );
                          return (
                            <span key={moduleKey} className="module">
                              {module?.name || moduleKey}
                            </span>
                          );
                        }) || <span className="no-data">No modules</span>}
                      </div>
                    </td>
                    <td>{user.country || "N/A"}</td>
                    <td>
                      <span className={`status ${user.status?.toLowerCase()}`}>
                        {user.status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {hasPermission(PERMISSIONS.UPDATE) && (
                          <button
                            className="btn-edit"
                            title="Edit"
                            onClick={() => handleEditUser(user)}
                            disabled={loading}
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          className="btn-view"
                          title="View"
                          onClick={() => handleViewUser(user)}
                          disabled={loading}
                        >
                          👁️
                        </button>
                        {hasPermission(PERMISSIONS.DELETE) && (
                          <button
                            className="btn-delete"
                            title="Delete"
                            onClick={() => handleDeleteUser(user)}
                            disabled={loading}
                          >
                            🗑️
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.MANAGE_ROLES) && (
                          <button
                            className="btn-role"
                            title="Manage Role"
                            onClick={() => handleManageRoles(user)}
                            disabled={loading}
                          >
                            👤
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) && (
                          <button
                            className="btn-permission"
                            title="Manage Permission"
                            onClick={() => handleManagePermissions(user)}
                            disabled={loading}
                          >
                            🔐
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.MANAGE_MODULES) && (
                          <button
                            className="btn-module"
                            title="Manage Module"
                            onClick={() => handleManageModules(user)}
                            disabled={loading}
                          >
                            📋
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.UPDATE) && (
                          <button
                            className="btn-lock"
                            title={
                              user.status?.toLowerCase() === "active"
                                ? "Lock User"
                                : "Unlock User"
                            }
                            onClick={() => handleToggleStatus(user)}
                            disabled={loading}
                          >
                            {user.status?.toLowerCase() === "active"
                              ? "🔒"
                              : "🔓"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSaveUser}
      />

      <RoleManagementModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSaveRoles}
      />

      <PermissionManagementModal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSavePermissions}
      />

      <ModuleManagementModal
        isOpen={isModuleModalOpen}
        onClose={() => {
          setIsModuleModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSaveModules}
      />

      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
