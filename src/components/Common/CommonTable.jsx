import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/common/CommonTable.css';

export const CommonTable = ({
  title,
  data,
  columns,
  loading,
  operationLoading,
  searchTerm,
  onSearch,
  onClearSearch,
  onAdd,
  searchPlaceholder = "Search...",
  addButtonText = "Add New",
  noDataMessage = "No data found",
  searchResultsCount,
  children
}) => {
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="page-header">
        <h1>{title}</h1>
        <button className="btn-add" onClick={onAdd}>
          + {addButtonText}
        </button>
      </div>

      <div className="list-container">
        <div className="list-header">
          <h5>{title}-List</h5>
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={onSearch}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={onClearSearch}>
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {searchTerm && (
          <div className="search-results-info">
            {searchResultsCount} item(s) found
          </div>
        )}

        <div className={`table-wrapper ${operationLoading ? 'table-loading-overlay' : ''}`}>
          <table className="data-table">
            <thead>
              <tr>
                <th>S.No</th>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={column.sortable ? column.sortClass : ''}
                    onClick={column.sortable ? () => column.onSort(column.field) : undefined}
                  >
                    {column.header}
                    {column.sortable && (
                      <span className="sort-indicator">
                        {column.sortIndicator}
                      </span>
                    )}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="serial-no">{index + 1}</td>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={column.className || ''}>
                      {column.render ? column.render(item) : item[column.field]}
                    </td>
                  ))}
                  <td>
                    {children && children(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="no-data">
            {searchTerm ? (
              <>
                No items found matching "{searchTerm}"
                <br />
                <button className="btn-clear-search" onClick={onClearSearch}>
                  Clear search
                </button>
              </>
            ) : (
              noDataMessage
            )}
          </div>
        )}
      </div>
    </div>
  );
};

CommonTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      sortClass: PropTypes.string,
      sortIndicator: PropTypes.string,
      onSort: PropTypes.func,
      render: PropTypes.func,
      className: PropTypes.string
    })
  ).isRequired,
  loading: PropTypes.bool,
  operationLoading: PropTypes.bool,
  searchTerm: PropTypes.string,
  onSearch: PropTypes.func,
  onClearSearch: PropTypes.func,
  onAdd: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  addButtonText: PropTypes.string,
  noDataMessage: PropTypes.string,
  searchResultsCount: PropTypes.number,
  children: PropTypes.func
};