import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  UserFormModal,
  UserViewModal,
  DeleteConfirmModal,
} from "./UserModals";
import "./User.css";

// Skeleton Loading Component
const UsersSkeleton = () => (
  <div className="user-container">
    <div className="page-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-button"></div>
    </div>

    <div className="users-list">
      <div className="user-list-header">
        <h5>User-List</h5>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email..."
              disabled
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="skeleton-table">
          <div className="skeleton-table-header">
            <div>S.No</div>
            <div>Name</div>
            <div>Email</div>
            <div>Roles</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`skeleton-${index}`} className="skeleton-row">
              <div className="skeleton-cell serial"></div>
              <div className="skeleton-cell name"></div>
              <div className="skeleton-cell email"></div>
              <div className="skeleton-cell roles"></div>
              <div className="skeleton-cell status"></div>
              <div className="skeleton-cell actions"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

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

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://localhost:7777/gateway/Users/get-all-user");
      const result = await response.json();

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
        // Update existing user
        const response = await fetch("https://localhost:7777/gateway/Users/user-update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingUser.id,
            ...userData,
          }),
        });

        const result = await response.json();
        if (result.success) {
          await fetchUsers();
          toast.success("User updated successfully!");
          setIsUserFormOpen(false);
          setEditingUser(null);
        } else {
          toast.error(result.message || "Failed to update user");
        }
      } else {
        // Create new user
        const response = await fetch("https://localhost:7777/gateway/Users/user-create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();
        if (result.success) {
          await fetchUsers();
          toast.success("User created successfully!");
          setIsUserFormOpen(false);
          setEditingUser(null);
        } else {
          toast.error(result.message || "Failed to create user");
        }
      }
    } catch (err) {
      toast.error("Error saving user. Please try again.");
      console.error("Error saving user:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async (userId) => {
    try {
      setOperationLoading(true);

      const response = await fetch(
        `https://localhost:7777/gateway/Users/user-delete/${userId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
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
    return <UsersSkeleton />;
  }

  if (error) {
    return (
      <div className="user-container">
        <h1>Users</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="user-container">
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn-add" onClick={handleAddUser}>
          + Add User
        </button>
      </div>

      <div className="users-list">
        <div className="user-list-header">
          <h5>User-List</h5>
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={clearSearch}>
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {searchTerm && (
          <div className="search-results-info">
            {getFilteredUsers().length} user(s) found
          </div>
        )}

        <div
          className={`table-wrapper ${
            operationLoading ? "table-loading-overlay" : ""
          }`}
        >
          <table className="users-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th
                  className={getSortClass("fullName")}
                  onClick={() => handleSort("fullName")}
                >
                  Name{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("fullName")}
                  </span>
                </th>
                <th
                  className={getSortClass("email")}
                  onClick={() => handleSort("email")}
                >
                  Email{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("email")}
                  </span>
                </th>
                <th>Roles</th>
                <th>Country</th>
                <th
                  className={getSortClass("status")}
                  onClick={() => handleSort("status")}
                >
                  Status{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("status")}
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedUsers().map((user, index) => (
                <tr key={user.id}>
                  <td className="serial-no">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="user-name">{user.fullName}</td>
                  <td className="user-email">
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                  <td className="user-roles">
                    {user.roles?.length > 0 ? (
                      <div className="roles-display">
                        {user.roles.slice(0, 2).map((role, idx) => (
                          <span key={`${user.id}-role-${idx}`} className="role-badge">
                            {role}
                          </span>
                        ))}
                        {user.roles.length > 2 && (
                          <span className="role-more">
                            +{user.roles.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-roles">No roles</span>
                    )}
                  </td>
                  <td className="user-country">{user.country || "N/A"}</td>
                  <td>
                    <span className={`status ${user.status?.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {getFilteredUsers().length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                getFilteredUsers().length
              )}{" "}
              of {getFilteredUsers().length} users
              {searchTerm && " (filtered)"}
            </div>

            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    const start = Math.max(1, currentPage - 2);
                    const end = Math.min(totalPages, currentPage + 2);
                    return page >= start && page <= end;
                  })
                  .map((page) => (
                    <button
                      key={page}
                      className={`pagination-number ${
                        page === currentPage ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
              </div>

              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {getFilteredUsers().length === 0 && users.length > 0 && (
          <div className="no-data">
            No users found matching "{searchTerm}"
            <br />
            <button className="btn-clear-search" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}

        {users.length === 0 && (
          <div className="no-data">No users found</div>
        )}
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSaveUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onConfirm={handleConfirmDelete}
      />

      {/* View User Details Modal */}
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};
