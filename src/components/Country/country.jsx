import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  CountryFormModal,
  DeleteConfirmModal,
  ViewCountryModal,
} from "./CountryModals";
import "./country.css";

// Skeleton Loading Component
const CountriesSkeleton = () => (
  <div className="country-container">
    <div className="page-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-button"></div>
    </div>

    <div className="countries-list">
      <div className="country-list-header">
        <h5>Country-List</h5>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by country name..."
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

export const Country = () => {
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
  const [isCountryFormOpen, setIsCountryFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [editingCountry, setEditingCountry] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://localhost:7777/gateway/Country/countries-all"
      );
      const result = await response.json();
      console.log("API Response:", result); // Debug log

      if (result.success) {
        // Map API response fields to component expected fields
        const mappedCountries = result.data.map(country => ({
          id: country.id,
          name: country.countryName,
          status: country.status === 'True' ? 'Active' : 'Inactive',
          createdAt: country.createdDate,
          updatedAt: country.modifiedDate
        }));
        
        console.log("Mapped Countries:", mappedCountries); // Debug log
        setCountries(mappedCountries);
        setTotalPages(Math.ceil(mappedCountries.length / itemsPerPage));
      } else {
        setError("Failed to fetch countries");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching countries:", err);
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

  // Get filtered countries based on search
  const getFilteredCountries = () => {
    if (!searchTerm.trim()) {
      return countries;
    }

    return countries.filter((country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get sorted countries
  const getSortedCountries = () => {
    return [...getFilteredCountries()].sort((a, b) => {
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

  // Get paginated countries
  const getPaginatedCountries = () => {
    const sortedCountries = getSortedCountries();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedCountries.slice(startIndex, endIndex);
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

  // Update total pages when countries or search term change
  React.useEffect(() => {
    const filteredCountries = getFilteredCountries();
    setTotalPages(Math.ceil(filteredCountries.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when search changes
  }, [countries, itemsPerPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const handleAddCountry = () => {
    setError(null); // Clear any previous errors
    setEditingCountry(null);
    setIsCountryFormOpen(true);
  };

  const handleEditCountry = (country) => {
    setError(null); // Clear any previous errors
    setEditingCountry(country);
    setIsCountryFormOpen(true);
  };

  const handleDeleteCountry = (country) => {
    setSelectedCountry(country);
    setIsDeleteModalOpen(true);
  };

  const handleViewCountry = (country) => {
    setSelectedCountry(country);
    setIsViewModalOpen(true);
  };

  // API handlers
  // Helper: Check for duplicate country name
  const isDuplicateCountry = (name, excludeId = null) => {
    return countries.some(
      (country) =>
        (excludeId ? country.id !== excludeId : true) &&
        country.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  // Helper: Handle API response for create/update
  const handleCountryApiResponse = async (
    response,
    countryData,
    successMsg,
    fetchCountriesCallback
  ) => {
    console.log("API Response status:", response.status);
    console.log("API Response ok:", response.ok);
    console.log("API Response headers:", [...response.headers.entries()]);
    
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        console.error("Error reading error response:", e);
        errorText = "Could not read error response";
      }
      console.error("HTTP Error:", response.status, response.statusText, errorText);
      toast.error(`HTTP Error: ${response.status} - ${response.statusText}`);
      return;
    }
    
    const result = await response.json();
    console.log("API Response result:", result);
    
    if (result.success && (!result.statusCode || result.statusCode === 200)) {
      await fetchCountriesCallback();
      toast.success(successMsg);
      setIsCountryFormOpen(false);
      setEditingCountry(null);
    } else {
      const errorMessage = result.message || `Failed to save country`;
      console.error("API Error:", errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSaveCountry = async (countryData) => {
    try {
      setOperationLoading(true);

      // Check for duplicate country name
      if (isDuplicateCountry(countryData.name, editingCountry?.id)) {
        toast.error("Country name already exists");
        setOperationLoading(false);
        return;
      }

      // Map form data to API expected format
      const apiData = {
        countryName: countryData.name,
        status: countryData.status === 'active' ? 'True' : 'False'
      };

      if (editingCountry) {
        // Update existing country - copied from Role component
        const response = await fetch(
          "https://localhost:7777/gateway/Country/country-update",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: editingCountry.id,
              countryName: countryData.name,
              status: countryData.status === "active", // boolean like Role
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          console.log("Country updated successfully:", result.data);
          // Refresh the countries list
          await fetchCountries();
          toast.success("Country updated successfully!");
          setIsCountryFormOpen(false);
          setEditingCountry(null);
        } else {
          toast.error(result.message || "Failed to update country");
        }
      } else {
        // Create new country
        const response = await fetch(
          "https://localhost:7777/gateway/Country/country-create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          }
        );

        await handleCountryApiResponse(
          response,
          countryData,
          "Country created successfully!",
          fetchCountries
        );
      }
    } catch (err) {
      console.error("Error in handleSaveCountry:", err);
      toast.error("Error saving country. Please try again.");
      console.error("Error saving country:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async (countryId) => {
    try {
      setOperationLoading(true);

      const response = await fetch(
        `https://localhost:7777/gateway/Country/country-delete/${countryId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (result.success) {
        await fetchCountries();
        toast.success("Country deleted successfully!");
      } else {
        toast.error("Failed to delete country");
      }

      setIsDeleteModalOpen(false);
      setSelectedCountry(null);
    } catch (err) {
      toast.error("Error deleting country");
      console.error("Error deleting country:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return <CountriesSkeleton />;
  }

  if (error) {
    return (
      <div className="country-container">
        <h1>Countries</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="country-container">
      <div className="page-header">
        <h1>Countries</h1>
        <button className="btn-add" onClick={handleAddCountry}>
          + Add Country
        </button>
      </div>

      <div className="countries-list">
        <div className="country-list-header">
          <h5>Country-List</h5>
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search by country name..."
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
            {getFilteredCountries().length} country(s) found
          </div>
        )}

        <div
          className={`table-wrapper ${
            operationLoading ? "table-loading-overlay" : ""
          }`}
        >
          <table className="countries-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th
                  className={getSortClass("name")}
                  onClick={() => handleSort("name")}
                >
                  Country Name{" "}
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
              {getPaginatedCountries().map((country, index) => (
                <tr key={country.id}>
                  <td className="serial-no">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="country-name">{country.name}</td>
                  <td>
                    <span className={`status ${country.status?.toLowerCase()}`}>
                      {country.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      title="View Country Details"
                      onClick={() => handleViewCountry(country)}
                      disabled={operationLoading}
                    >
                      👁️
                    </button>
                    <button
                      className="btn-edit"
                      title="Edit Country"
                      onClick={() => handleEditCountry(country)}
                      disabled={operationLoading}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      title="Delete Country"
                      onClick={() => handleDeleteCountry(country)}
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
        {getFilteredCountries().length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                getFilteredCountries().length
              )}{" "}
              of {getFilteredCountries().length} countries
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

        {getFilteredCountries().length === 0 && countries.length > 0 && (
          <div className="no-data">
            No countries found matching "{searchTerm}"
            <br />
            <button className="btn-clear-search" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}

        {countries.length === 0 && (
          <div className="no-data">No countries found</div>
        )}
      </div>

      {/* Country Form Modal */}
      <CountryFormModal
        isOpen={isCountryFormOpen}
        onClose={() => {
          setIsCountryFormOpen(false);
          setEditingCountry(null);
        }}
        country={editingCountry}
        onSave={handleSaveCountry}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCountry(null);
        }}
        country={selectedCountry}
        onConfirm={handleConfirmDelete}
      />

      {/* View Country Details Modal */}
      <ViewCountryModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCountry(null);
        }}
        country={selectedCountry}
      />
    </div>
  );
};
