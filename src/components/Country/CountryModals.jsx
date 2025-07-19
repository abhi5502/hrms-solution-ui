
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../styles/common/CommonModal.css";

// Add/Edit Country Modal (City style)
export const CountryFormModal = ({ isOpen, onClose, country = null, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    status: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  // City style: use <dialog> for modal, .form-modal for modal-content, .modal-header, .modal-footer, .form-group

  let submitButtonText;
  if (isSubmitting) {
    submitButtonText = country ? "Updating..." : "Creating...";
  } else {
    submitButtonText = country ? "Update Country" : "Create Country";
  }

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      onClose={onClose}
    >
      <div
        className="modal-content form-modal"
        tabIndex={-1}
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
        onKeyDown={e => {
          if (e.key === "Escape") onClose();
        }}
      >
        <div className="modal-header">
          <h2>{country ? "Edit Country" : "Add Country"}</h2>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting || loading}
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Country Name <span style={{color: '#ff5252'}}>*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "error" : ""}
                  placeholder="Enter country name"
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="status">Status <span style={{color: '#ff5252'}}>*</span></label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={errors.status ? "error" : ""}
                  disabled={isSubmitting || loading}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && <span className="error-text">{errors.status}</span>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSubmitting || loading}
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

CountryFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  country: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

// View Country Modal (City style)
export const ViewCountryModal = ({ isOpen, onClose, country }) => {
  if (!isOpen || !country) return null;

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      onClose={onClose}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={e => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="modal-content view-modal">
        <div className="modal-header">
          <h2>Country Details</h2>
          <button
            className="close-btn"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="details-container">
            <div className="detail-row">
              <span className="detail-label">Country Name:</span>
              <span className="detail-value">{country.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                <span className={`status ${country.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                  {country.status}
                </span>
              </span>
            </div>
            {country.createdAt && (
              <div className="detail-row">
                <span className="detail-label">Created At:</span>
                <span className="detail-value">{new Date(country.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {country.updatedAt && (
              <div className="detail-row">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">{new Date(country.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

ViewCountryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  country: PropTypes.object,
};

// Delete Confirmation Modal (City style)
export const DeleteConfirmModal = ({ isOpen, onClose, country, onConfirm, loading }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !country) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm(country.id);
    setIsDeleting(false);
  };

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      onClose={onClose}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={e => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="modal-content delete-modal"
        style={{ outline: "none" }}
      >
        <div className="modal-header">
          <h2>Confirm Delete</h2>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isDeleting || loading}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <p>Are you sure you want to delete this country?</p>
          <div style={{ fontWeight: 600, margin: '10px 0' }}>
            Country Name: <span style={{ fontWeight: 700 }}>{country.name}</span>
          </div>
          <p style={{ color: '#ff5252', fontWeight: 500 }}>This action cannot be undone.</p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center', gap: 16 }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isDeleting || loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-delete"
            onClick={handleConfirm}
            disabled={isDeleting || loading}
          >
            {isDeleting ? "Deleting..." : "Delete Country"}
          </button>
        </div>
      </div>
    </dialog>
  );
};

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  country: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
};
