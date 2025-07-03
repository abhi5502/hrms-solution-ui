import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./RoleModals.css";

// Add/Edit Role Modal
export const RoleFormModal = ({ isOpen, onClose, role = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        status: role.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        status: "Active",
      });
    }
    setErrors({});
  }, [role, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
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
      <div className="modal-content role-form-modal">
        <div className="modal-header">
          <h2>{role ? "Edit Role" : "Add New Role"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Role Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter role name"
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
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {role ? "Update Role" : "Add Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PropTypes for RoleFormModal
RoleFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    status: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

// Delete Confirmation Modal
export const DeleteConfirmModal = ({ isOpen, onClose, role, onConfirm }) => {
  if (!isOpen || !role) return null;

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
            Are you sure you want to delete the role{" "}
            <strong>"{role.name}"</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone and may affect users assigned to this
            role.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-delete" onClick={() => onConfirm(role.id)}>
            Delete Role
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
  }),
  onConfirm: PropTypes.func.isRequired,
};

// PropTypes for RoleFormModal
RoleFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    status: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

// View Role Details Modal
export const ViewRoleModal = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

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
      <div className="modal-content view-role-modal">
        <div className="modal-header">
          <h2>Role Details</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="role-details">
            <div className="detail-row">
              <label>Role Name:</label>
              <span className="detail-value">{role.name}</span>
            </div>

            <div className="detail-row">
              <label>Status:</label>
              <span className={`status ${role.status.toLowerCase()}`}>
                {role.status}
              </span>
            </div>

            <div className="detail-row">
              <label>Created Date:</label>
              <span className="detail-value">
                {formatDate(role.createdAt || role.createdDate)}
              </span>
            </div>

            <div className="detail-row">
              <label>Modified Date:</label>
              <span className="detail-value">
                {formatDate(
                  role.updatedAt || role.modifiedDate || role.lastModified
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

// PropTypes for ViewRoleModal
ViewRoleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    createdDate: PropTypes.string,
    updatedAt: PropTypes.string,
    modifiedDate: PropTypes.string,
    lastModified: PropTypes.string,
  }),
};
