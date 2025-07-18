import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  ModuleFormModal,
  DeleteConfirmModal,
  ViewModuleModal,
} from "./ModuleModals";
import { API_ENDPOINTS, apiHelper } from "../../config/apiConfig";
import "./module.css";

// Skeleton Loading Component
const ModulesSkeleton = () => (
  <div className="module-container">
    <div className="page-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-button"></div>
    </div>

    <div className="modules-list">
      <div className="module-list-header">
        <h5>Module-List</h5>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by module name..."
              disabled
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="skeleton-table">
          <div className="skeleton-table-header">
            <div>S.No</div>
            <div>Module Name</div>
            <div>Description</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`skeleton-${index}`} className="skeleton-row">
              <div className="skeleton-cell serial"></div>
              <div className="skeleton-cell name"></div>
              <div className="skeleton-cell description"></div>
              <div className="skeleton-cell status"></div>
              <div className="skeleton-cell actions"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const Module = () => {
  const [modules, setModules] = useState([]);
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
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [editingModule, setEditingModule] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching modules from:", API_ENDPOINTS.MODULES.GET_ALL);
      
      const result = await apiHelper.get(API_ENDPOINTS.MODULES.GET_ALL);
      
      console.log("API Response:", result);

      if (result.success) {
        setModules(result.data);
        setTotalPages(Math.ceil(result.data.length / itemsPerPage));
      } else {
        setError("Failed to fetch modules");
        toast.error("Failed to fetch modules");
      }
    } catch (err) {
      setError("Error connecting to server");
      toast.error("Error connecting to server");
      console.error("Error fetching modules:", err);
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

  // Get filtered modules based on search
  const getFilteredModules = () => {
    if (!searchTerm.trim()) {
      return modules;
    }

    return modules.filter((module) =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get sorted modules
  const getSortedModules = () => {
    return [...getFilteredModules()].sort((a, b) => {
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

  // Get paginated modules
  const getPaginatedModules = () => {
    const sortedModules = getSortedModules();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedModules.slice(startIndex, endIndex);
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

  // Update total pages when modules or search term change
  React.useEffect(() => {
    const filteredModules = getFilteredModules();
    setTotalPages(Math.ceil(filteredModules.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when search changes
  }, [modules, itemsPerPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const handleAddModule = () => {
    setError(null); // Clear any previous errors
    setEditingModule(null);
    setIsModuleFormOpen(true);
  };

  const handleEditModule = (module) => {
    setError(null); // Clear any previous errors
    setEditingModule(module);
    setIsModuleFormOpen(true);
  };

  const handleDeleteModule = (module) => {
    setSelectedModule(module);
    setIsDeleteModalOpen(true);
  };

  const handleViewModule = (module) => {
    setSelectedModule(module);
    setIsViewModalOpen(true);
  };

  // API handlers
  // Helper: Check for duplicate module name
  const isDuplicateModule = (name, excludeId = null) => {
    return modules.some(
      (module) =>
        (excludeId ? module.id !== excludeId : true) &&
        module.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  // Helper: Handle API response for create/update
  const handleModuleApiResponse = async (
    result,
    moduleData,
    successMsg,
    fetchModulesCallback
  ) => {
    if (result.success && (!result.statusCode || result.statusCode === 200)) {
      await fetchModulesCallback();
      toast.success(successMsg);
      return true;
    } else if (result.statusCode === 409) {
      toast.error(
        `Module "${moduleData.name}" already exists! Please choose a different name.`
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

  // Helper: Update module
  const updateModule = async (moduleData) => {
    try {
      const requestData = {
        id: editingModule.id,
        name: moduleData.name,
        description: moduleData.description,
        status: moduleData.status === "active",
      };

      const result = await apiHelper.put(API_ENDPOINTS.MODULES.UPDATE, requestData);

      return await handleModuleApiResponse(
        result,
        moduleData,
        "Module updated successfully!",
        fetchModules
      );
    } catch (err) {
      console.error("Update module error:", err);
      toast.error(`Failed to update module: ${err.message}`);
      return false;
    }
  };

  // Helper: Create module
  const createModule = async (moduleData) => {
    try {
      const result = await apiHelper.post(API_ENDPOINTS.MODULES.CREATE, {
        name: moduleData.name,
        description: moduleData.description,
      });

      return await handleModuleApiResponse(
        result,
        moduleData,
        "Module created successfully!",
        fetchModules
      );
    } catch (err) {
      console.error("Create module error:", err);
      toast.error(`Failed to create module: ${err.message}`);
      return false;
    }
  };

  const handleSaveModule = async (moduleData) => {
    try {
      setOperationLoading(true);
      let operationSuccessful = false;

      if (editingModule) {
        // Update existing module - Check for duplicates (excluding current module)
        if (isDuplicateModule(moduleData.name, editingModule.id)) {
          toast.error(
            `Module "${moduleData.name}" already exists! Please choose a different name.`
          );
          return;
        }
        operationSuccessful = await updateModule(moduleData);
      } else {
        // Add new module - Check for duplicates first
        if (isDuplicateModule(moduleData.name)) {
          toast.error(
            `Module "${moduleData.name}" already exists! Please choose a different name.`
          );
          return;
        }
        operationSuccessful = await createModule(moduleData);
      }

      // Only close modal and clear editing state if the operation was successful
      if (operationSuccessful) {
        setIsModuleFormOpen(false);
        setEditingModule(null);
      }
    } catch (err) {
      toast.error("Error saving module. Please try again.");
      console.error("Error saving module:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async (moduleId) => {
    try {
      setOperationLoading(true);

      const result = await apiHelper.delete(API_ENDPOINTS.MODULES.DELETE(moduleId));

      if (result.success) {
        // Refresh the modules list
        await fetchModules();
        toast.success("Module deleted successfully!");
      } else {
        toast.error("Failed to delete module");
      }

      setIsDeleteModalOpen(false);
      setSelectedModule(null);
    } catch (err) {
      toast.error("Error deleting module");
      console.error("Error deleting module:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return <ModulesSkeleton />;
  }

  if (error) {
    return (
      <div className="module-container">
        <h1>Modules</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="page-header">
        <h1>Modules</h1>
        <button className="btn-add" onClick={handleAddModule}>
          + Add Module
        </button>
      </div>

      <div className="modules-list">
        <div className="module-list-header">
          <h5>Module-List</h5>
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search by module name..."
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
            {getFilteredModules().length} module(s) found
          </div>
        )}

        <div
          className={`table-wrapper ${
            operationLoading ? "table-loading-overlay" : ""
          }`}
        >
          <table className="modules-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th
                  className={getSortClass("name")}
                  onClick={() => handleSort("name")}
                >
                  Module Name{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("name")}
                  </span>
                </th>
                <th
                  className={getSortClass("description")}
                  onClick={() => handleSort("description")}
                >
                  Description{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("description")}
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
              {getPaginatedModules().map((module, index) => (
                <tr key={module.id}>
                  <td className="serial-no">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="module-name">{module.name}</td>
                  <td className="module-description">{module.description}</td>
                  <td>
                    <span className={`status ${module.status.toLowerCase()}`}>
                      {module.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      title="View Module Details"
                      onClick={() => handleViewModule(module)}
                      disabled={operationLoading}
                    >
                      👁️
                    </button>
                    <button
                      className="btn-edit"
                      title="Edit Module"
                      onClick={() => handleEditModule(module)}
                      disabled={operationLoading}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      title="Delete Module"
                      onClick={() => handleDeleteModule(module)}
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
        {getFilteredModules().length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                getFilteredModules().length
              )}{" "}
              of {getFilteredModules().length} modules
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

        {getFilteredModules().length === 0 && modules.length > 0 && (
          <div className="no-data">
            No modules found matching "{searchTerm}"
            <br />
            <button className="btn-clear-search" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}

        {modules.length === 0 && (
          <div className="no-data">No modules found</div>
        )}
      </div>

      {/* Module Form Modal */}
      <ModuleFormModal
        isOpen={isModuleFormOpen}
        onClose={() => {
          setIsModuleFormOpen(false);
          setEditingModule(null);
        }}
        module={editingModule}
        onSave={handleSaveModule}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedModule(null);
        }}
        module={selectedModule}
        onConfirm={handleConfirmDelete}
      />

      {/* View Module Details Modal */}
      <ViewModuleModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedModule(null);
        }}
        module={selectedModule}
      />
    </div>
  );
};