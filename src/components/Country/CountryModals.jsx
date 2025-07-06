import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./CountryModals.css";

// Add/Edit Country Modal
export const CountryFormModal = ({
  isOpen,
  onClose,
  country = null,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    status: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (country) {
      setFormData({
        name: country.name || "",
        status: country.status ? country.status.toLowerCase() : "",
      });
    } else {
      setFormData({
        name: "",
        status: "",
      });
    }
    setErrors({});
  }, [country, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Country name is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (e) => {
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{country ? "Edit Country" : "Add Country"}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Country Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter country name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={errors.status ? "error" : ""}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && (
                <span className="error-text">{errors.status}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {country ? "Update" : "Create"} Country
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CountryFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  country: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

// View Country Modal
export const ViewCountryModal = ({ isOpen, onClose, country }) => {
  if (!isOpen || !country) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Country Details</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <div className="detail-item">
              <span className="detail-label">Country Name:</span>
              <span>{country.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`status ${country.status?.toLowerCase()}`}>
                {country.status}
              </span>
            </div>
            {country.createdAt && (
              <div className="detail-item">
                <span className="detail-label">Created At:</span>
                <span>{new Date(country.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {country.updatedAt && (
              <div className="detail-item">
                <span className="detail-label">Last Updated:</span>
                <span>{new Date(country.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

ViewCountryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  country: PropTypes.object,
};

// Delete Confirmation Modal
export const DeleteConfirmModal = ({ isOpen, onClose, country, onConfirm }) => {
  if (!isOpen || !country) return null;

  const handleConfirm = () => {
    onConfirm(country.id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h3>Confirm Delete</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-message">
            <p>Are you sure you want to delete this country?</p>
            <div className="delete-details">
              <strong>Country Name:</strong> {country.name}
            </div>
            <p className="warning">This action cannot be undone.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-delete" onClick={handleConfirm}>
            Delete Country
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  country: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
};
