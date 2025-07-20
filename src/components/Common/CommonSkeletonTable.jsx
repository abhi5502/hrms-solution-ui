import React from "react";
import PropTypes from "prop-types";
import "../../styles/common/CommonSkeleton.css";

/**
 * CommonSkeletonTable
 * @param {Object} props
 * @param {string} props.containerClass - Outer container class (e.g. user-container, country-container)
 * @param {string} props.headerTitle - Title for the skeleton header (e.g. User-List, Country-List)
 * @param {string[]} props.columns - Array of column names (e.g. ["S.No", "Name", ...])
 * @param {string[]} props.skeletonCells - Array of cell class names for each column (e.g. ["serial", "name", ...])
 * @param {string} [props.searchPlaceholder] - Placeholder for the search input
 * @param {number} [props.rows] - Number of skeleton rows (default 6)
 */
export const CommonSkeletonTable = ({
  containerClass = "",
  headerTitle = "",
  columns = [],
  skeletonCells = [],
  searchPlaceholder = "Search...",
  rows = 6
}) => (
  <div className={containerClass}>
    <div className="page-header">
      <div className="skeleton-title"></div>
      <div className="skeleton-button"></div>
    </div>
    <div className="users-list">
      <div className="user-list-header">
        <h5>{headerTitle}</h5>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder={searchPlaceholder}
              disabled
            />
          </div>
        </div>
      </div>
      <div className="table-wrapper">
        <div className="skeleton-table">
          <div className="skeleton-table-header">
            {columns.map((col, idx) => (
              <div key={col + idx}>{col}</div>
            ))}
          </div>
          {Array.from({ length: rows }, (_, index) => (
            <div key={`skeleton-${index}`} className="skeleton-row">
              {skeletonCells.map((cellClass, i) => (
                <div key={cellClass + i} className={`skeleton-cell ${cellClass}`}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

CommonSkeletonTable.propTypes = {
  containerClass: PropTypes.string,
  headerTitle: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.string),
  skeletonCells: PropTypes.arrayOf(PropTypes.string),
  searchPlaceholder: PropTypes.string,
  rows: PropTypes.number
};
