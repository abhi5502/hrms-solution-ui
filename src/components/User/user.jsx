import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import {
  UserFormModal,
  UserViewModal,
  DeleteConfirmModal,
} from "./UserModals";
import { CommonTable } from "../Common/CommonTable";
import { CommonPagination } from "../Common/CommonPagination";
import { API_ENDPOINTS, apiHelper } from "../../config/apiConfig";
import "./User.css";
import "../../styles/common/CommonSkeleton.css";
import "../../styles/common/CommonTable.css";
import { CommonSkeletonTable } from "../Common/CommonSkeletonTable";

// Helper to get current username from localStorage
function getCurrentUsername() {
  try {
    const userStr = localStorage.getItem("user");
    console.log("localStorage user item:", userStr); // Yeh log karega user ki raw value
    if (!userStr) return null;
    const userObj = JSON.parse(userStr);
    return userObj?.username || null;
  } catch (e) {
    console.error("Error getting current username:", e);
    return null;
  }
}

export const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  // Lock/Unlock modal state
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockUser, setLockUser] = useState(null);
  const [lockOperationLoading, setLockOperationLoading] = useState(false);
  // Lock/Unlock handlers
  const handleLockUserClick = (user) => {
    setLockUser(user);
    setIsLockModalOpen(true);
  };

  const handleConfirmLockToggle = async () => {
    if (!lockUser) return;
    setLockOperationLoading(true);
    try {
      const payload = {
        id: lockUser.id,
        isUserLocked: !lockUser.isUserLocked,
        modifiedBy: getCurrentUsername(),
      };
      const result = await apiHelper.put(API_ENDPOINTS.USERS.UPDATE_User_Lock, payload);
      if (result.success) {
        toast.success(result.message || "User lock status updated successfully.");
        // Update user in local state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === lockUser.id ? { ...u, isUserLocked: payload.isUserLocked } : u
          )
        );
        setIsLockModalOpen(false);
        setLockUser(null);
      } else {
        toast.error(result.message || "Failed to update user lock status.");
      }
    } catch (err) {
      toast.error("Error updating user lock status.");
      console.error("Lock/Unlock error:", err);
    } finally {
      setLockOperationLoading(false);
    }
  };

  const handleCancelLockToggle = () => {
    setIsLockModalOpen(false);
    setLockUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching users from:", API_ENDPOINTS.USERS.GET_ALL);
      
      const result = await apiHelper.get(API_ENDPOINTS.USERS.GET_ALL);
      
      console.log("API Response:", result);

      if (result.success) {
        setUsers(result.data);
        setTotalPages(Math.ceil(result.data.length / itemsPerPage));
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get filtered users based on search
  const getFilteredUsers = () => {
    if (!searchTerm.trim()) {
      return users;
    }

    return users.filter((user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roles?.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Get sorted users
  const getSortedUsers = () => {
    return [...getFilteredUsers()].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string sorting
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  // Lock/Unlock icon helper
  const getLockIcon = (isLocked) => {
    return isLocked ? "🔒" : "🔓";
  };

  // Get paginated users
  const getPaginatedUsers = () => {
    const sortedUsers = getSortedUsers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedUsers.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Update total pages when users or search term change
  React.useEffect(() => {
    const filteredUsers = getFilteredUsers();
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when search changes
  }, [users, itemsPerPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Get sort indicator for table headers
  const getSortIndicator = (field) => {
    if (sortField === field) {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }
    return " ↕";
  };

  // Get sort class for table headers
  const getSortClass = (field) => {
    const baseClass = "sortable";
    if (sortField === field) {
      return `${baseClass} sorted-${sortDirection}`;
    }
    return baseClass;
  };

  // Modal handlers
  const handleAddUser = () => {
    setError(null); // Clear any previous errors
    setEditingUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user) => {
    setError(null); // Clear any previous errors
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // API handlers
  const handleSaveUser = async (userData) => {
    try {
      setOperationLoading(true);

      if (editingUser) {
        // Update user
        const payload = {
          ...userData,
          id: editingUser.id,
          modifiedBy: getCurrentUsername(),
          // Convert status to boolean for API
          status: userData.status && userData.status.toLowerCase() === "active"
        };
        const result = await apiHelper.put(API_ENDPOINTS.USERS.UPDATE, payload);
        if (result.success) {
          toast.success(result.message || "User updated successfully.");
          await fetchUsers();
          setIsUserFormOpen(false);
        } else {
          toast.error(result.message || "Failed to update user.");
        }
      } else {
        // Create user
        const payload = {
          ...userData,
          createdBy: getCurrentUsername(),
        };
        const result = await apiHelper.post(API_ENDPOINTS.USERS.CREATE, payload);
        if (result.success) {
          toast.success(result.message || "User created successfully.");
          await fetchUsers();
          setIsUserFormOpen(false);
        } else {
          toast.error(result.message || "Failed to create user.");
        }
      }
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error(`Error saving user: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async (userId) => {
    try {
      setOperationLoading(true);

      const result = await apiHelper.delete(API_ENDPOINTS.USERS.DELETE(userId));

      if (result.success) {
        await fetchUsers();
        toast.success("User deleted successfully!");
      } else {
        toast.error("Failed to delete user");
      }

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      toast.error("Error deleting user");
      console.error("Error deleting user:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    // Use the common skeleton loader with 6 columns (Full Name, Email, Roles, Permissions, Modules, Status) and 10 rows
    return (
      <CommonSkeletonTable
        columns={["Full Name", "Email", "Roles", "Permissions", "Modules", "Status"]}
        skeletonCells={[1, 2, 3, 4, 5, 6]}
        rowCount={10}
      />
    );
  }

  if (error) {
    return (
      <div className="error">Error: {error}</div>
    );
  }

  // Table columns
  const columns = [
    {
      field: "fullName",
      header: "Full Name",
      sortable: true,
      sortClass: getSortClass("fullName"),
      sortIndicator: getSortIndicator("fullName"),
      onSort: handleSort,
      className: "user-name",
      render: (user) => user.fullName,
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
      sortClass: getSortClass("email"),
      sortIndicator: getSortIndicator("email"),
      onSort: handleSort,
      className: "user-email",
      render: (user) => user.email,
    },
    {
      field: "roles",
      header: "Roles",
      sortable: false,
      className: "user-roles",
      render: (user) =>
        user.roles && user.roles.length > 0 ? (
          <span className="roles-display">
            {user.roles.slice(0, 2).map((role) => (
              <span key={role} className="role-badge">{role}</span>
            ))}
            {user.roles.length > 2 && (
              <span className="role-more">+{user.roles.length - 2}</span>
            )}
          </span>
        ) : (
          <span className="no-roles">No Roles</span>
        ),
    },
    {
      field: "permissions",
      header: "Permissions",
      sortable: false,
      className: "user-permissions",
      render: (user) =>
        user.permissions && user.permissions.length > 0 ? (
          <span className="permissions-display">
            {user.permissions.slice(0, 2).map((perm) => (
              <span key={perm} className="permission-badge">{perm}</span>
            ))}
            {user.permissions.length > 2 && (
              <span className="permission-more">+{user.permissions.length - 2}</span>
            )}
          </span>
        ) : (
          <span className="no-permissions">No Permissions</span>
        ),
    },
    {
      field: "modules",
      header: "Modules",
      sortable: false,
      className: "user-modules",
      render: (user) =>
        user.modules && user.modules.length > 0 ? (
          <span className="modules-display">
            {user.modules.slice(0, 2).map((mod) => (
              <span key={mod} className="module-badge">{mod}</span>
            ))}
            {user.modules.length > 2 && (
              <span className="module-more">+{user.modules.length - 2}</span>
            )}
          </span>
        ) : (
          <span className="no-modules">No Modules</span>
        ),
    },
     {
            field: 'status',
            header: 'Status',
            sortable: true,
            sortClass: getSortClass('status'),
            sortIndicator: getSortIndicator('status'),
            onSort: handleSort,
            render: (user) => (
                <span className={`status ${user.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                    {user.status}
                </span>
            )
        },
    // Actions column removed; handled by CommonTable children
  ];

  return (
    <>
      <CommonTable
        title="Users"
        data={getPaginatedUsers()}
        columns={columns}
        loading={loading}
        operationLoading={operationLoading}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        onAdd={handleAddUser}
        searchPlaceholder="Search users, emails, roles..."
        addButtonText="Add User"
        noDataMessage="No users found"
        searchResultsCount={getFilteredUsers().length}
        paginationContent={
          getFilteredUsers().length > 0 && (
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={getFilteredUsers().length}
              searchTerm={searchTerm}
              onPageChange={handlePageChange}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          )
        }
      >
        {(user) => (
          <div>
            <button
              className="btn-lock"
              title={user.isUserLocked ? "Unlock User" : "Lock User"}
              onClick={() => handleLockUserClick(user)}
              disabled={operationLoading || lockOperationLoading}
              style={{ background: 'none' }}
            >
              {getLockIcon(user.isUserLocked)}
            </button>
            <button
              className="btn-view"
              title="View User Details"
              onClick={() => handleViewUser(user)}
              disabled={operationLoading}
            >
              👁️
            </button>
            <button
              className="btn-edit"
              title="Edit User"
              onClick={() => handleEditUser(user)}
              disabled={operationLoading}
            >
              ✏️
            </button>
            <button
              className="btn-delete"
              title="Delete User"
              onClick={() => handleDeleteUser(user)}
              disabled={operationLoading}
            >
              🗑️
            </button>
          </div>
        )}
      </CommonTable>

      {/* Lock/Unlock Modal */}
      {isLockModalOpen && lockUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400, minWidth: 320, textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', background: 'none' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                {lockUser.isUserLocked ? 'Are you sure to Unlock this user?' : 'Are you sure to Lock this user?'}
              </h2>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: 20, borderTop: 'none', background: 'none', marginTop: 20 }}>
              <button
                className="btn-save"
                onClick={handleConfirmLockToggle}
                disabled={lockOperationLoading}
                style={{ minWidth: 100 }}
              >
                Confirm
              </button>
              <button
                className="btn-cancel"
                onClick={handleCancelLockToggle}
                disabled={lockOperationLoading}
                style={{ minWidth: 100 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserFormModal
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        user={editingUser}
        onSave={handleSaveUser}
      />
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={selectedUser}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}