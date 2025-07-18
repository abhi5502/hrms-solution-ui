import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  PermissionFormModal,
  DeleteConfirmModal,
  ViewPermissionModal,
} from "./PermissionModals";
import { API_ENDPOINTS, apiHelper } from "../../config/apiConfig";
import "./permission.css";

// Skeleton Loading Component
const PermissionsSkeleton = () => (
  <div className="permission-container">
    <div className="page-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-button"></div>
    </div>

    <div className="permissions-list">
      <div className="permission-list-header">
        <h5>Permission-List</h5>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by permission name..."
              disabled
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="skeleton-table">
          <div className="skeleton-table-header">
            <div>S.No</div>
            <div>Permission Name</div>
            <div>Action</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`skeleton-${index}`} className="skeleton-row">
              <div className="skeleton-cell serial"></div>
              <div className="skeleton-cell name"></div>
              <div className="skeleton-cell action"></div>
              <div className="skeleton-cell status"></div>
              <div className="skeleton-cell actions"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const Permission = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isPermissionFormOpen, setIsPermissionFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching permissions from:", API_ENDPOINTS.PERMISSIONS.GET_ALL);
      
      const result = await apiHelper.get(API_ENDPOINTS.PERMISSIONS.GET_ALL);
      
      console.log("API Response:", result);

      if (result.success) {
        setPermissions(result.data);
        setTotalPages(Math.ceil(result.data.length / itemsPerPage));
      } else {
        setError("Failed to fetch permissions");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching permissions:", err);
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

  // Get filtered permissions based on search
  const getFilteredPermissions = () => {
    if (!searchTerm.trim()) {
      return permissions;
    }

    return permissions.filter((permission) =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get sorted permissions
  const getSortedPermissions = () => {
    return [...getFilteredPermissions()].sort((a, b) => {
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

  // Get paginated permissions
  const getPaginatedPermissions = () => {
    const sortedPermissions = getSortedPermissions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedPermissions.slice(startIndex, endIndex);
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

  // Update total pages when permissions or search term change
  React.useEffect(() => {
    const filteredPermissions = getFilteredPermissions();
    setTotalPages(Math.ceil(filteredPermissions.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when search changes
  }, [permissions, itemsPerPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const handleAddPermission = () => {
    setError(null); // Clear any previous errors
    setEditingPermission(null);
    setIsPermissionFormOpen(true);
  };

  const handleEditPermission = (permission) => {
    setError(null); // Clear any previous errors
    setEditingPermission(permission);
    setIsPermissionFormOpen(true);
  };

  const handleDeletePermission = (permission) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const handleViewPermission = (permission) => {
    setSelectedPermission(permission);
    setIsViewModalOpen(true);
  };

  // API handlers
  // Helper: Check for duplicate permission name
  const isDuplicatePermission = (name, excludeId = null) => {
    return permissions.some(
      (permission) =>
        (excludeId ? permission.id !== excludeId : true) &&
        permission.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  // Helper: Handle API response for create/update
  const handlePermissionApiResponse = async (
    result,
    permissionData,
    successMsg,
    fetchPermissionsCallback
  ) => {
    if (result.success && (!result.statusCode || result.statusCode === 200)) {
      await fetchPermissionsCallback();
      toast.success(successMsg);
      return true;
    } else if (result.statusCode === 409) {
      toast.error(
        `Permission "${permissionData.name}" already exists! Please choose a different name.`
      );
    } else {
      toast.error(
        result.message ||
          `Failed to ${successMsg
            .toLowerCase()
            .replace(" successfully!", "")}`
      );
    }
    return false;
  };

  // Helper: Update permission
  const updatePermission = async (permissionData) => {
    try {
      const requestData = {
        id: editingPermission.id,
        name: permissionData.name,
        action: permissionData.action,
        description: permissionData.description,
        status: permissionData.status === "active",
      };

      const result = await apiHelper.put(API_ENDPOINTS.PERMISSIONS.UPDATE, requestData);

      return await handlePermissionApiResponse(
        result,
        permissionData,
        "Permission updated successfully!",
        fetchPermissions
      );
    } catch (err) {
      console.error("Update permission error:", err);
      toast.error(`Failed to update permission: ${err.message}`);
      return false;
    }
  };

  // Helper: Create permission
  const createPermission = async (permissionData) => {
    try {
      const result = await apiHelper.post(API_ENDPOINTS.PERMISSIONS.CREATE, {
        name: permissionData.name,
        action: permissionData.action,
        description: permissionData.description,
      });

      return await handlePermissionApiResponse(
        result,
        permissionData,
        "Permission created successfully!",
        fetchPermissions
      );
    } catch (err) {
      console.error("Create permission error:", err);
      toast.error(`Failed to create permission: ${err.message}`);
      return false;
    }
  };

  const handleSavePermission = async (permissionData) => {
    try {
      setOperationLoading(true);
      let operationSuccessful = false;

      if (editingPermission) {
        // Update existing permission - Check for duplicates (excluding current permission)
        if (isDuplicatePermission(permissionData.name, editingPermission.id)) {
          toast.error(
            `Permission "${permissionData.name}" already exists! Please choose a different name.`
          );
          return;
        }
        operationSuccessful = await updatePermission(permissionData);
      } else {
        // Add new permission - Check for duplicates first
        if (isDuplicatePermission(permissionData.name)) {
          toast.error(
            `Permission "${permissionData.name}" already exists! Please choose a different name.`
          );
          return;
        }
        operationSuccessful = await createPermission(permissionData);
      }

      // Only close modal and clear editing state if the operation was successful
      if (operationSuccessful) {
        setIsPermissionFormOpen(false);
        setEditingPermission(null);
      }
    } catch (err) {
      toast.error("Error saving permission. Please try again.");
      console.error("Error saving permission:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async (permissionId) => {
    try {
      setOperationLoading(true);

      const result = await apiHelper.delete(API_ENDPOINTS.PERMISSIONS.DELETE(permissionId));

      if (result.success) {
        // Refresh the permissions list
        await fetchPermissions();
        toast.success("Permission deleted successfully!");
      } else {
        toast.error("Failed to delete permission");
      }

      setIsDeleteModalOpen(false);
      setSelectedPermission(null);
    } catch (err) {
      toast.error("Error deleting permission");
      console.error("Error deleting permission:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return <PermissionsSkeleton />;
  }

  if (error) {
    return (
      <div className="permission-container">
        <h1>Permissions</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="permission-container">
      <div className="page-header">
        <h1>Permissions</h1>
        <button className="btn-add" onClick={handleAddPermission}>
          + Add Permission
        </button>
      </div>

      <div className="permissions-list">
        <div className="permission-list-header">
          <h5>Permission-List</h5>
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search by permission name..."
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
            {getFilteredPermissions().length} permission(s) found
          </div>
        )}

        <div
          className={`table-wrapper ${
            operationLoading ? "table-loading-overlay" : ""
          }`}
        >
          <table className="permissions-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th
                  className={getSortClass("name")}
                  onClick={() => handleSort("name")}
                >
                  Permission Name{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("name")}
                  </span>
                </th>
                <th
                  className={getSortClass("action")}
                  onClick={() => handleSort("action")}
                >
                  Action{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("action")}
                  </span>
                </th>
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
              {getPaginatedPermissions().map((permission, index) => (
                <tr key={permission.id}>
                  <td className="serial-no">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="permission-name">{permission.name}</td>
                  <td className="permission-action">{permission.action}</td>
                  <td>
                    <span
                      className={`status ${permission.status.toLowerCase()}`}
                    >
                      {permission.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      title="View Permission Details"
                      onClick={() => handleViewPermission(permission)}
                      disabled={operationLoading}
                    >
                      👁️
                    </button>
                    <button
                      className="btn-edit"
                      title="Edit Permission"
                      onClick={() => handleEditPermission(permission)}
                      disabled={operationLoading}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      title="Delete Permission"
                      onClick={() => handleDeletePermission(permission)}
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
        {getFilteredPermissions().length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                getFilteredPermissions().length
              )}{" "}
              of {getFilteredPermissions().length} permissions
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

        {getFilteredPermissions().length === 0 && permissions.length > 0 && (
          <div className="no-data">
            No permissions found matching "{searchTerm}"
            <br />
            <button className="btn-clear-search" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}

        {permissions.length === 0 && (
          <div className="no-data">No permissions found</div>
        )}
      </div>

      {/* Permission Form Modal */}
      <PermissionFormModal
        isOpen={isPermissionFormOpen}
        onClose={() => {
          setIsPermissionFormOpen(false);
          setEditingPermission(null);
        }}
        permission={editingPermission}
        onSave={handleSavePermission}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPermission(null);
        }}
        permission={selectedPermission}
        onConfirm={handleConfirmDelete}
      />

      {/* View Permission Details Modal */}
      <ViewPermissionModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPermission(null);
        }}
        permission={selectedPermission}
      />
    </div>
  );
};