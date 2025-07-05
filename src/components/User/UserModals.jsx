import React, { useState, useEffect } from "react";
import "./UserModals.css";

// Add/Edit User Modal
export const UserFormModal = ({ isOpen, onClose, user = null, onSave }) => {
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    country: "",
    phoneNumber: "",
    gender: 0, // 0 = Male, 1 = Female
    roleIds: [],
    permissionIds: [],
    moduleIds: [],
  });

  const [errors, setErrors] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchPermissions();
      fetchModules();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        userName: user.userName || "",
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        country: user.country || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender === "Female" ? 1 : 0,
        roleIds: user.roleIds || [],
        permissionIds: user.permissionIds || [],
        moduleIds: user.moduleIds || [],
      });
    } else {
      setFormData({
        email: "",
        userName: "",
        firstName: "",
        middleName: "",
        lastName: "",
        country: "",
        phoneNumber: "",
        gender: 0,
        roleIds: [],
        permissionIds: [],
        moduleIds: [],
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const fetchRoles = async () => {
    try {
      const response = await fetch("https://localhost:7777/gateway/Roles/get-all-role");
      const result = await response.json();
      if (result.success) {
        setAvailableRoles(result.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch("https://localhost:7777/gateway/Permissions/permissions-all");
      const result = await response.json();
      if (result.success) {
        setAvailablePermissions(result.data);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch("https://localhost:7777/gateway/Module/getall-module");
      const result = await response.json();
      if (result.success) {
        setAvailableModules(result.data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (formData.roleIds.length === 0)
      newErrors.roleIds = "At least one role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await onSave(formData);
        onClose();
      } catch (error) {
        console.error("Error saving user:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleCheckboxChange = (type, id, checked) => {
    const fieldName = `${type}Ids`;
    const newValues = checked
      ? [...formData[fieldName], id]
      : formData[fieldName].filter((item) => item !== id);

    setFormData({
      ...formData,
      [fieldName]: newValues,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user ? "Edit User" : "Add New User"}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
                placeholder="Enter email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="userName">Username</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? "error" : ""}
                placeholder="Enter first name"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="middleName">Middle Name</label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Enter middle name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? "error" : ""}
                placeholder="Enter last name"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={errors.country ? "error" : ""}
                placeholder="Enter country"
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={errors.phoneNumber ? "error" : ""}
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value={0}>Male</option>
                <option value={1}>Female</option>
              </select>
            </div>
          </div>

          {/* Roles Section */}
          <div className="form-section">
            <h3>Roles *</h3>
            <div className="checkbox-grid">
              {availableRoles.map((role) => (
                <label key={role.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.id)}
                    onChange={(e) =>
                      handleCheckboxChange("role", role.id, e.target.checked)
                    }
                  />
                  {role.name}
                </label>
              ))}
            </div>
            {errors.roleIds && <span className="error-message">{errors.roleIds}</span>}
          </div>

          {/* Permissions Section */}
          <div className="form-section">
            <h3>Permissions</h3>
            <div className="checkbox-grid">
              {availablePermissions.map((permission) => (
                <label key={permission.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.permissionIds.includes(permission.id)}
                    onChange={(e) =>
                      handleCheckboxChange("permission", permission.id, e.target.checked)
                    }
                  />
                  {permission.name}
                </label>
              ))}
            </div>
          </div>

          {/* Modules Section */}
          <div className="form-section">
            <h3>Modules</h3>
            <div className="checkbox-grid">
              {availableModules.map((module) => (
                <label key={module.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.moduleIds.includes(module.id)}
                    onChange={(e) =>
                      handleCheckboxChange("module", module.id, e.target.checked)
                    }
                  />
                  {module.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Saving..." : user ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User View Modal
export const UserViewModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="user-details">
          <div className="detail-row">
            <label>Full Name:</label>
            <span>{user.fullName}</span>
          </div>
          <div className="detail-row">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="detail-row">
            <label>Username:</label>
            <span>{user.userName}</span>
          </div>
          <div className="detail-row">
            <label>Phone:</label>
            <span>{user.phoneNumber}</span>
          </div>
          <div className="detail-row">
            <label>Gender:</label>
            <span>{user.gender}</span>
          </div>
          <div className="detail-row">
            <label>Country:</label>
            <span>{user.country}</span>
          </div>
          <div className="detail-row">
            <label>Status:</label>
            <span className={`status ${user.status?.toLowerCase()}`}>
              {user.status}
            </span>
          </div>
          <div className="detail-row">
            <label>Roles:</label>
            <div className="roles-display">
              {user.roles?.map((role, index) => (
                <span key={index} className="role-badge">
                  {role}
                </span>
              )) || <span>No roles assigned</span>}
            </div>
          </div>
          <div className="detail-row">
            <label>Permissions:</label>
            <div className="permissions-display">
              {user.permissions?.length > 0 ? (
                user.permissions.map((permission, index) => (
                  <span key={index} className="permission-badge">
                    {permission}
                  </span>
                ))
              ) : (
                <span>No permissions assigned</span>
              )}
            </div>
          </div>
          <div className="detail-row">
            <label>Modules:</label>
            <div className="modules-display">
              {user.modules?.length > 0 ? (
                user.modules.map((module, index) => (
                  <span key={index} className="module-badge">
                    {module}
                  </span>
                ))
              ) : (
                <span>No modules assigned</span>
              )}
            </div>
          </div>
          <div className="detail-row">
            <label>Created Date:</label>
            <span>{new Date(user.createdDate).toLocaleDateString()}</span>
          </div>
          {user.modifiedDate && (
            <div className="detail-row">
              <label>Modified Date:</label>
              <span>{new Date(user.modifiedDate).toLocaleDateString()}</span>
            </div>
          )}
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

// Delete Confirmation Modal
export const DeleteConfirmModal = ({ isOpen, onClose, user, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>Confirm Delete</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="delete-content">
          <div className="warning-icon">⚠️</div>
          <p>Are you sure you want to delete this user?</p>
          <div className="user-info">
            <strong>{user.fullName}</strong>
            <span>{user.email}</span>
          </div>
          <p className="warning-text">
            This action cannot be undone. The user will be permanently removed from the system.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-delete" onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};
