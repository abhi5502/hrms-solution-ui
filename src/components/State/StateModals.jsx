import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./StateModals.css";

// Add/Edit State Modal
export const StateFormModal = ({
  isOpen,
  onClose,
  state = null,
  countries = [],
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    countryId: "",
    status: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (state) {
      // Find the country ID for the state being edited
      const country = countries.find(c => c.name === state.countryName);
      setFormData({
        name: state.name || "",
        countryId: country?.id || "",
        status: state.status ? state.status.toLowerCase() : "",
      });
    } else {
      setFormData({
        name: "",
        countryId: "",
        status: "",
      });
    }
    setErrors({});
  }, [state, countries, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "State name is required";
    }

    if (!formData.countryId) {
      newErrors.countryId = "Country is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      countryId: "",
      status: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content state-modal">
        <div className="modal-header">
          <h3>{state ? "Edit State" : "Add New State"}</h3>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="countryId" className="form-label">
              Country *
            </label>
            <select
              id="countryId"
              name="countryId"
              value={formData.countryId}
              onChange={handleChange}
              className={`form-input ${errors.countryId ? "error" : ""}`}
            >
              <option value="">Select Country</option>
              {countries
                .filter(country => country.status === 'Active')
                .map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
            </select>
            {errors.countryId && (
              <span className="error-message">{errors.countryId}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              State Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter state name"
              className={`form-input ${errors.name ? "error" : ""}`}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`form-input ${errors.status ? "error" : ""}`}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <span className="error-message">{errors.status}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {state ? "Update State" : "Save State"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

StateFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  state: PropTypes.object,
  countries: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
};

// View State Modal
export const ViewStateModal = ({ isOpen, onClose, state }) => {
  if (!isOpen || !state) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content view-modal">
        <div className="modal-header">
          <h3>State Details</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="view-content">
          <div className="detail-group">
            <label className="detail-label">Country Name:</label>
            <span className="detail-value">{state.countryName}</span>
          </div>

          <div className="detail-group">
            <label className="detail-label">State Name:</label>
            <span className="detail-value">{state.name}</span>
          </div>

          <div className="detail-group">
            <label className="detail-label">Status:</label>
            <span className={`status ${state.status?.toLowerCase()}`}>
              {state.status}
            </span>
          </div>

          <div className="detail-group">
            <label className="detail-label">Created Date:</label>
            <span className="detail-value">{formatDate(state.createdAt)}</span>
          </div>

          <div className="detail-group">
            <label className="detail-label">Modified Date:</label>
            <span className="detail-value">{formatDate(state.updatedAt)}</span>
          </div>
        </div>

        <div className="view-actions">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

ViewStateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  state: PropTypes.object,
};

// Delete Confirmation Modal
export const DeleteConfirmModal = ({ isOpen, onClose, state, onConfirm }) => {
  if (!isOpen || !state) return null;

  const handleConfirm = () => {
    onConfirm(state.id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h3>Confirm Delete</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="delete-content">
          <div className="warning-icon">⚠️</div>
          <p>Are you sure you want to delete this state?</p>
          <div className="state-info">
            <strong>Country:</strong> {state.countryName}
            <br />
            <strong>State:</strong> {state.name}
          </div>
          <p className="warning-text">This action cannot be undone.</p>
        </div>

        <div className="delete-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-delete" onClick={handleConfirm}>
            Delete State
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  state: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
};
