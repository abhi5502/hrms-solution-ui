import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  StateFormModal,
  DeleteConfirmModal,
  ViewStateModal,
} from "./StateModals";
import { API_ENDPOINTS, apiHelper } from "../../config/apiConfig";
import "./state.css";

// Skeleton Loading Component
const StatesSkeleton = () => (
  <div className="state-container">
    <div className="page-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-button"></div>
    </div>

    <div className="states-list">
      <div className="state-list-header">
        <h5>State-List</h5>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by state name..."
              disabled
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="skeleton-table">
          <div className="skeleton-table-header">
            <div>S.No</div>
            <div>Country Name</div>
            <div>State Name</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`skeleton-${index}`} className="skeleton-row">
              <div className="skeleton-cell serial"></div>
              <div className="skeleton-cell country"></div>
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

export const State = () => {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
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
  const [isStateFormOpen, setIsStateFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [editingState, setEditingState] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchStates(), fetchCountries()]);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      setError(null);
      
      console.log("Fetching states from:", API_ENDPOINTS.STATES.GET_ALL);
      
      const result = await apiHelper.get(API_ENDPOINTS.STATES.GET_ALL);
      
      console.log("States API Response:", result);

      if (result.success) {
        // Map API response fields to component expected fields
        const mappedStates = result.data.map(state => ({
          id: state.id,
          name: state.stateName,
          countryName: state.countryName,
          countryId: state.countryId, // Add countryId for editing
           status: state.status === 'True' ? 'Active' : 'Inactive', 
          createdAt: state.createdDate,
          updatedAt: state.modifiedDate
        }));
        
        console.log("Mapped States:", mappedStates);
        setStates(mappedStates);
        setTotalPages(Math.ceil(mappedStates.length / itemsPerPage));
      } else {
        setError("Failed to fetch states");
        toast.error("Failed to fetch states");
      }
    } catch (err) {
      setError("Error connecting to server");
      toast.error("Error connecting to server");
      console.error("Error fetching states:", err);
    }
  };

  const fetchCountries = async () => {
    try {
      console.log("Fetching countries from:", API_ENDPOINTS.COUNTRIES.GET_ALL);
      
      const result = await apiHelper.get(API_ENDPOINTS.COUNTRIES.GET_ALL);
      
      console.log("Countries API Response:", result);

      if (result.success) {
        // Map API response fields to component expected fields
        const mappedCountries = result.data.map(country => ({
          id: country.id,
          name: country.countryName,
          status: state.status === 'True' ? 'Active' : 'Inactive', // Direct mapping
        }));
        
        console.log("Mapped Countries:", mappedCountries);
        setCountries(mappedCountries);
      } else {
        console.error("Failed to fetch countries");
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
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

  // Get filtered states based on search
  const getFilteredStates = () => {
    if (!searchTerm.trim()) {
      return states;
    }

    return states.filter((state) =>
      state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.countryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get sorted states
  const getSortedStates = () => {
    return [...getFilteredStates()].sort((a, b) => {
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

  // Get paginated states
  const getPaginatedStates = () => {
    const sortedStates = getSortedStates();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedStates.slice(startIndex, endIndex);
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

  // Update total pages when states or search term change
  React.useEffect(() => {
    const filteredStates = getFilteredStates();
    setTotalPages(Math.ceil(filteredStates.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when search changes
  }, [states, itemsPerPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const handleAddState = () => {
    setError(null); // Clear any previous errors
    setEditingState(null);
    setIsStateFormOpen(true);
  };

  const handleEditState = (state) => {
    setError(null); // Clear any previous errors
    setEditingState(state);
    setIsStateFormOpen(true);
  };

  const handleDeleteState = (state) => {
    setSelectedState(state);
    setIsDeleteModalOpen(true);
  };

  const handleViewState = (state) => {
    setSelectedState(state);
    setIsViewModalOpen(true);
  };

  // API handlers
  // Helper: Check for duplicate state name
  const isDuplicateState = (name, countryName, excludeId = null) => {
    return states.some(
      (state) =>
        (excludeId ? state.id !== excludeId : true) &&
        state.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        state.countryName.toLowerCase().trim() === countryName.toLowerCase().trim()
    );
  };

  // Helper: Handle API response for create/update
  const handleStateApiResponse = async (
    result,
    stateData,
    successMsg,
    fetchStatesCallback
  ) => {
    if (result.success && (!result.statusCode || result.statusCode === 200)) {
      await fetchStatesCallback();
      toast.success(successMsg);
      return true;
    } else if (result.statusCode === 409) {
      toast.error(
        `State "${stateData.name}" already exists in this country! Please choose a different name.`
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

  // Helper: Update state
  const updateState = async (stateData) => {
    try {
      const requestData = {
        id: editingState.id,
        stateName: stateData.name,
        countryId: stateData.countryId,
        status: stateData.status.toLowerCase() === "active" // Boolean conversion
      };

      console.log("Update state request data:", requestData);

      const result = await apiHelper.put(API_ENDPOINTS.STATES.UPDATE, requestData);

      return await handleStateApiResponse(
        result,
        stateData,
        "State updated successfully!",
        fetchStates
      );
    } catch (err) {
      console.error("Update state error:", err);
      toast.error(`Failed to update state: ${err.message}`);
      return false;
    }
  };

  // Helper: Create state
  const createState = async (stateData) => {
    try {
      const requestData = {
        stateName: stateData.name,
        countryId: stateData.countryId,
      };

      console.log("Create state request data:", requestData);

      const result = await apiHelper.post(API_ENDPOINTS.STATES.CREATE, requestData);

      return await handleStateApiResponse(
        result,
        stateData,
        "State created successfully!",
        fetchStates
      );
    } catch (err) {
      console.error("Create state error:", err);
      toast.error(`Failed to create state: ${err.message}`);
      return false;
    }
  };

  const handleSaveState = async (stateData) => {
    try {
      setOperationLoading(true);

      // Find the selected country to get its name
      const selectedCountry = countries.find(c => c.id === stateData.countryId);
      if (!selectedCountry) {
        toast.error("Please select a valid country");
        return;
      }

      // Check for duplicate state name in the same country
      if (isDuplicateState(stateData.name, selectedCountry.name, editingState?.id)) {
        toast.error("State name already exists in this country");
        return;
      }

      let operationSuccessful = false;

      if (editingState) {
        // Update existing state
        operationSuccessful = await updateState(stateData);
      } else {
        // Create new state
        operationSuccessful = await createState(stateData);
      }

      // Only close modal and clear editing state if the operation was successful
      if (operationSuccessful) {
        setIsStateFormOpen(false);
        setEditingState(null);
      }
    } catch (err) {
      toast.error("Error saving state. Please try again.");
      console.error("Error saving state:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async (stateId) => {
    try {
      setOperationLoading(true);

      const result = await apiHelper.delete(API_ENDPOINTS.STATES.DELETE(stateId));

      if (result.success) {
        // Refresh the states list
        await fetchStates();
        toast.success("State deleted successfully!");
      } else {
        toast.error("Failed to delete state");
      }

      setIsDeleteModalOpen(false);
      setSelectedState(null);
    } catch (err) {
      toast.error("Error deleting state");
      console.error("Error deleting state:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return <StatesSkeleton />;
  }

  if (error) {
    return (
      <div className="state-container">
        <h1>States</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="state-container">
      <div className="page-header">
        <h1>States</h1>
        <button className="btn-add" onClick={handleAddState}>
          + Add State
        </button>
      </div>

      <div className="states-list">
        <div className="state-list-header">
          <h5>State-List</h5>
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search by state or country name..."
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
            {getFilteredStates().length} state(s) found
          </div>
        )}

        <div
          className={`table-wrapper ${
            operationLoading ? "table-loading-overlay" : ""
          }`}
        >
          <table className="states-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th
                  className={getSortClass("countryName")}
                  onClick={() => handleSort("countryName")}
                >
                  Country Name{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("countryName")}
                  </span>
                </th>
                <th
                  className={getSortClass("name")}
                  onClick={() => handleSort("name")}
                >
                  State Name{" "}
                  <span className="sort-indicator">
                    {getSortIndicator("name")}
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
              {getPaginatedStates().map((state, index) => (
                <tr key={state.id}>
                  <td className="serial-no">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="country-name">{state.countryName}</td>
                  <td className="state-name">{state.name}</td>
                  <td>
                    <span className={`status ${state.status?.toLowerCase()}`}>
                      {state.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      title="View State Details"
                      onClick={() => handleViewState(state)}
                      disabled={operationLoading}
                    >
                      👁️
                    </button>
                    <button
                      className="btn-edit"
                      title="Edit State"
                      onClick={() => handleEditState(state)}
                      disabled={operationLoading}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      title="Delete State"
                      onClick={() => handleDeleteState(state)}
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
        {getFilteredStates().length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                getFilteredStates().length
              )}{" "}
              of {getFilteredStates().length} states
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

        {getFilteredStates().length === 0 && states.length > 0 && (
          <div className="no-data">
            No states found matching "{searchTerm}"
            <br />
            <button className="btn-clear-search" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}

        {states.length === 0 && (
          <div className="no-data">No states found</div>
        )}
      </div>

      {/* State Form Modal */}
      <StateFormModal
        isOpen={isStateFormOpen}
        onClose={() => {
          setIsStateFormOpen(false);
          setEditingState(null);
        }}
        state={editingState}
        countries={countries}
        onSave={handleSaveState}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedState(null);
        }}
        state={selectedState}
        onConfirm={handleConfirmDelete}
      />

      {/* View State Details Modal */}
      <ViewStateModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedState(null);
        }}
        state={selectedState}
      />
    </div>
  );
};