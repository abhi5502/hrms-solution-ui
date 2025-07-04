import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./PermissionModals.css";

// Add/Edit Permission Modal
export const PermissionFormModal = ({
  isOpen,
  onClose,
  permission = null,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    action: "",
    description: "",
    status: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name || "",
        action: permission.action || "",
        description: permission.description || "",
        status: permission.status ? permission.status.toLowerCase() : "",
      });
    } else {
      setFormData({
        name: "",
        action: "",
        description: "",
        status: "",
      });
    }
    setErrors({});
  }, [permission, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Permission name is required";
    }

    if (!formData.action.trim()) {
      newErrors.action = "Action is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Only validate status if we're editing (permission exists)
    if (permission && !formData.status.trim()) {
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
      <div className="modal-content permission-form-modal">
        <div className="modal-header">
          <h2>{permission ? "Edit Permission" : "Add New Permission"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Permission Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "error" : ""}
                  placeholder="Enter permission name"
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="action">Action *</label>
                <input
                  type="text"
                  id="action"
                  name="action"
                  value={formData.action}
                  onChange={handleInputChange}
                  className={errors.action ? "error" : ""}
                  placeholder="Enter action (e.g., Create, Read, Update, Delete)"
                />
                {errors.action && (
                  <span className="error-text">{errors.action}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? "error" : ""}
                  placeholder="Enter permission description"
                />
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </div>

              {/* Show Status dropdown only when editing */}
              {permission && (
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
              {permission ? "Update Permission" : "Add Permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PropTypes for PermissionFormModal
PermissionFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  permission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    action: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

// Delete Confirmation Modal
export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  permission,
  onConfirm,
}) => {
  if (!isOpen || !permission) return null;

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
            Are you sure you want to delete the permission{" "}
            <strong>"{permission.name}"</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone and may affect users assigned to this
            permission.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-delete"
            onClick={() => onConfirm(permission.id)}
          >
            Delete Permission
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  permission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
  }),
  onConfirm: PropTypes.func.isRequired,
};

// View Permission Details Modal
export const ViewPermissionModal = ({ isOpen, onClose, permission }) => {
  if (!isOpen || !permission) return null;

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
      <div className="modal-content view-permission-modal">
        <div className="modal-header">
          <h2>Permission Details</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="permission-details">
            <div className="detail-row">
              <div className="detail-label">Permission Name:</div>
              <span className="detail-value">{permission.name}</span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Action:</div>
              <span className="detail-value">{permission.action}</span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Description:</div>
              <span className="detail-value">{permission.description}</span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Status:</div>
              <span className={`status ${permission.status.toLowerCase()}`}>
                {permission.status}
              </span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Created Date:</div>
              <span className="detail-value">
                {formatDate(permission.createdAt || permission.createdDate)}
              </span>
            </div>

            <div className="detail-row">
              <div className="detail-label">Modified Date:</div>
              <span className="detail-value">
                {formatDate(
                  permission.updatedAt ||
                    permission.modifiedDate ||
                    permission.lastModified
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

// PropTypes for ViewPermissionModal
ViewPermissionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  permission: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    createdDate: PropTypes.string,
    updatedAt: PropTypes.string,
    modifiedDate: PropTypes.string,
    lastModified: PropTypes.string,
  }),
};
