import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/common/CommonTable.css';

export const CommonPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  searchTerm,
  onPageChange,
  onPrevPage,
  onNextPage
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startItem} to {endItem} of {totalItems} items
        {searchTerm && " (filtered)"}
      </div>

      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={onPrevPage}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>

        <div className="pagination-numbers">
          {getVisiblePages().map(page => (
            <button
              key={page}
              className={`pagination-number ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

CommonPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  searchTerm: PropTypes.string,
  onPageChange: PropTypes.func.isRequired,
  onPrevPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired
};