import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS, apiHelper } from "../../config/apiConfig";
import "../../styles/common/CommonTable.css";
import "../../styles/common/CommonModal.css";

import { CommonTable } from "../Common/CommonTable";
import { CommonPagination } from "../Common/CommonPagination";
import { CompanyModal, ViewCompanyModal, DeleteConfirmCompanyModal } from "./CompanyModals";

export const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting states
  const [sortField, setSortField] = useState("legalName");
  const [sortDirection, setSortDirection] = useState("asc");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiHelper.get(API_ENDPOINTS.Company.GET_ALL);
      if (result.success) {
        const mappedCompanies = result.data.map(company => ({
          id: company.id,
          legalName: company.legalName,
          registrationNumber: company.registrationNumber,
          status: company.status === "True" ? "Active" : "Inactive",
          createdBy: company.createdBy,
          createdDate: company.createdDate,
          modifiedBy: company.modifiedBy,
          modifiedDate: company.modifiedDate,
          // add more fields as needed...
        }));
        setCompanies(mappedCompanies);
        setTotalPages(Math.ceil(mappedCompanies.length / itemsPerPage));
      } else {
        setError("Failed to fetch companies");
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Error connecting to server");
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
    setCurrentPage(1);
  };

  const getFilteredCompanies = useCallback(() => {
    if (!searchTerm.trim()) {
      return companies;
    }
    return companies.filter((company) =>
      company.legalName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const getSortedCompanies = () => {
    return [...getFilteredCompanies()].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
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

  const getPaginatedCompanies = () => {
    const sortedCompanies = getSortedCompanies();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedCompanies.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const handlePageChange = (page) => setCurrentPage(page);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  useEffect(() => {
    const filteredCompanies = getFilteredCompanies();
    setTotalPages(Math.ceil(filteredCompanies.length / itemsPerPage));
    setCurrentPage(1);
  }, [companies, itemsPerPage, searchTerm, getFilteredCompanies]);

  // Search handler
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");

  // Table columns
  const columns = [
    {
      field: "legalName",
      header: "Legal Name",
      sortable: true,
      sortClass: getSortClass("legalName"),
      sortIndicator: getSortIndicator("legalName"),
      onSort: handleSort,
      className: "company-legal-name",
      render: (company) => company.legalName,
    },
    {
      field: "registrationNumber",
      header: "Registration Number",
      sortable: true,
      sortClass: getSortClass("registrationNumber"),
      sortIndicator: getSortIndicator("registrationNumber"),
      onSort: handleSort,
      render: (company) => company.registrationNumber,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      sortClass: getSortClass("status"),
      sortIndicator: getSortIndicator("status"),
      onSort: handleSort,
      render: (company) => (
        <span className={`status ${company.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
          {company.status}
        </span>
      )
    }
  ];

  function getSortIndicator(field) {
    if (sortField === field) {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }
    return " ↕";
  }

  function getSortClass(field) {
    const baseClass = "sortable";
    if (sortField === field) {
      return `${baseClass} sorted-${sortDirection}`;
    }
    return baseClass;
  }

  // Modal handlers
  const handleAddCompany = () => {
    setEditingCompany(null);
    setIsCompanyFormOpen(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setIsCompanyFormOpen(true);
  };

  const handleDeleteCompany = (company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <CommonTable
        title="Companies"
        data={getPaginatedCompanies()}
        columns={columns}
        loading={loading}
        operationLoading={operationLoading}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        onAdd={handleAddCompany}
        searchPlaceholder="Search by legal name..."
        addButtonText="Add Company"
        noDataMessage="No companies found"
        searchResultsCount={getFilteredCompanies().length}
        paginationContent={
          getFilteredCompanies().length > 0 && (
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={getFilteredCompanies().length}
              searchTerm={searchTerm}
              onPageChange={handlePageChange}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          )
        }
      >
        {(company) => (
          <div>
            <button
              className="btn-view"
              title="View Company Details"
              onClick={() => handleViewCompany(company)}
              disabled={operationLoading}
            >
              👁️
            </button>
            <button
              className="btn-edit"
              title="Edit Company"
              onClick={() => handleEditCompany(company)}
              disabled={operationLoading}
            >
              ✏️
            </button>
            <button
              className="btn-delete"
              title="Delete Company"
              onClick={() => handleDeleteCompany(company)}
              disabled={operationLoading}
            >
              🗑️
            </button>
          </div>
        )}
      </CommonTable>
      <CompanyModal
        isOpen={isCompanyFormOpen}
        onClose={() => setIsCompanyFormOpen(false)}
        company={editingCompany}
        onSave={() => {}}
        loading={operationLoading}
      />
      <ViewCompanyModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        company={selectedCompany}
      />
      <DeleteConfirmCompanyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        company={selectedCompany}
        onConfirm={() => {}}
        loading={operationLoading}
      />
    </>
  );
};
