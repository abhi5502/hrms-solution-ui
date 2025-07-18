import { useState, useEffect } from 'react';

export const useCommonTable = (initialData = [], itemsPerPage = 10) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sorting states
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Get filtered data based on search
  const getFilteredData = (searchFields = ['name']) => {
    if (!searchTerm.trim()) {
      return data;
    }

    return data.filter(item =>
      searchFields.some(field => 
        item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // Get sorted data
  const getSortedData = (searchFields = ['name']) => {
    const filteredData = getFilteredData(searchFields);
    
    if (!sortField) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Get paginated data
  const getPaginatedData = (searchFields = ['name']) => {
    const sortedData = getSortedData(searchFields);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Update total pages when data or search term changes
  useEffect(() => {
    const filteredData = getFilteredData(['name']);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    setCurrentPage(1);
  }, [data, itemsPerPage, searchTerm]);

  // Search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓';
    }
    return ' ↕';
  };

  // Get sort class
  const getSortClass = (field) => {
    const baseClass = 'sortable';
    if (sortField === field) {
      return `${baseClass} sorted-${sortDirection}`;
    }
    return baseClass;
  };

  // Modal handlers
  const handleAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const closeModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedItem(null);
    setEditingItem(null);
  };

  return {
    // Data
    data,
    setData,
    loading,
    setLoading,
    operationLoading,
    setOperationLoading,
    
    // Pagination
    currentPage,
    totalPages,
    handlePageChange,
    handlePrevPage,
    handleNextPage,
    
    // Sorting
    sortField,
    sortDirection,
    handleSort,
    getSortIndicator,
    getSortClass,
    
    // Search
    searchTerm,
    handleSearch,
    clearSearch,
    
    // Data getters
    getFilteredData,
    getSortedData,
    getPaginatedData,
    
    // Modals
    isFormModalOpen,
    isDeleteModalOpen,
    isViewModalOpen,
    selectedItem,
    editingItem,
    handleAdd,
    handleEdit,
    handleDelete,
    handleView,
    closeModals,
    
    // Constants
    itemsPerPage
  };
};