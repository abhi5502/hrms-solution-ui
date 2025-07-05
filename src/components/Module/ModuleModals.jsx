import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./ModuleModals.css";

// Add/Edit Module Modal
export const ModuleFormModal = ({ isOpen, onClose, module = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (module) {
      setFormData({
        name: module.name || "",
        description: module.description || "",
        status: module.status ? module.status.toLowerCase() : "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "",
      });
    }
    setErrors({});
  }, [module, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Module name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Only validate status if we're editing (module exists)
    if (module && !formData.status.trim()) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content module-form-modal">
        <div className="modal-header">
          <h2>{module ? "Edit Module" : "Add New Module"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Module Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "error" : ""}
                  placeholder="Enter module name"
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? "error" : ""}
                  placeholder="Enter module description"
                />
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              {/* Show Status dropdown only when editing */}
              {module && (
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={errors.status ? "error" : ""}
                  >
                    <option value="">-- Select Status --</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <span className="error-text">{errors.status}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {module ? "Update Module" : "Add Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PropTypes for ModuleFormModal
ModuleFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  module: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

// Delete Confirmation Modal
export const DeleteConfirmModal = ({ isOpen, onClose, module, onConfirm }) => {
  if (!isOpen || !module) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>Confirm Delete</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="warning-icon">⚠️</div>
          <p>
            Are you sure you want to delete the module{" "}
            <strong>"{module.name}"</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone and may affect users assigned to this
            module.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-delete" onClick={() => onConfirm(module.id)}>
            Delete Module
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  module: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
  }),
  onConfirm: PropTypes.func.isRequired,
};

// View Module Details Modal
export const ViewModuleModal = ({ isOpen, onClose, module }) => {
  if (!isOpen || !module) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content view-module-modal">
        <div className="modal-header">
          <h2>Module Details</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="module-details">
            <div className="detail-row">
              <div className="detail-label">Module Name:</div>
              <span className="detail-value">{module.name}</span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Description:</div>
              <span className="detail-value">{module.description}</span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Status:</div>
              <span className={`status ${module.status.toLowerCase()}`}>
                {module.status}
              </span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Created Date:</div>
              <span className="detail-value">
                {formatDate(module.createdAt || module.createdDate)}
              </span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Modified Date:</div>
              <span className="detail-value">
                {formatDate(
                  module.updatedAt || module.modifiedDate || module.lastModified
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// PropTypes for ViewModuleModal
ViewModuleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  module: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    createdDate: PropTypes.string,
    updatedAt: PropTypes.string,
    modifiedDate: PropTypes.string,
    lastModified: PropTypes.string,
  }),
};
