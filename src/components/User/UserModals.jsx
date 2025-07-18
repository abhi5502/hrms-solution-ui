
import React, { useState, useEffect } from "react";
import "./UserModals.css";

// Add/Edit User Modal
export const UserFormModal = ({ isOpen, onClose, user = null, onSave }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    country: "",
    phoneNumber: "",
    password: "", // Add password field
    gender: 0, // 0 = Male, 1 = Female
    status: "Active", // Add status field
    roleIds: [],
    permissionIds: [],
    moduleIds: [],
  });

  const [errors, setErrors] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search states for filtering
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [moduleSearchTerm, setModuleSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      fetchRoles();
      fetchPermissions();
      fetchModules();
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      // Convert role/permission/module names to IDs for editing
      let roleIds = [];
      let permissionIds = [];
      let moduleIds = [];

      if (user.roles && availableRoles.length > 0) {
        roleIds = availableRoles
          .filter(role => user.roles.includes(role.name))
          .map(role => role.id);
      }

      if (user.permissions && availablePermissions.length > 0) {
        permissionIds = availablePermissions
          .filter(permission => user.permissions.includes(permission.name))
          .map(permission => permission.id);
      }

      if (user.modules && availableModules.length > 0) {
        moduleIds = availableModules
          .filter(module => user.modules.includes(module.name))
          .map(module => module.id);
      }

      setFormData({
        email: user.email || "",
        userName: user.userName || "",
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        country: user.country || "",
        phoneNumber: user.phoneNumber || "",
        password: "", // Don't populate password when editing
        gender: user.gender === "Female" ? 1 : 0,
        status: user.status || "Active",
        roleIds: roleIds,
        permissionIds: permissionIds,
        moduleIds: moduleIds,
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
        password: "", // Reset password field
        gender: 0,
        status: "Active",
        roleIds: [],
        permissionIds: [],
        moduleIds: [],
      });
    }
    setErrors({});
    setActiveTab("basic");
  }, [user, isOpen, availableRoles, availablePermissions, availableModules]);

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    
    // Password validation - only required for new users
    if (!user) {
      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }
    
    if (!formData.status) newErrors.status = "Status is required";
    if (formData.roleIds.length === 0)
      newErrors.roleIds = "At least one role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getButtonText = (loading, user) => {
    if (loading) return "Saving...";
    return user ? "Update User" : "Create User";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data being submitted:", formData);
    console.log("Form validation result:", validateForm());
    
    if (validateForm()) {
      setLoading(true);
      try {
        await onSave(formData);
      } catch (error) {
        console.error("Error saving user:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Form validation errors:", errors);
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

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: "",
      });
    }
  };

  // Handle assign all functionality
  const handleAssignAll = (type) => {
    const fieldName = `${type}Ids`;
    let allIds = [];
    
    if (type === "role") {
      allIds = availableRoles.filter(item => item.status === "Active").map(item => item.id);
    } else if (type === "permission") {
      allIds = availablePermissions.filter(item => item.status === "Active").map(item => item.id);
    } else if (type === "module") {
      allIds = availableModules.filter(item => item.status === "Active").map(item => item.id);
    }

    setFormData({
      ...formData,
      [fieldName]: allIds,
    });

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: "",
      });
    }
  };

  // Handle remove all functionality
  const handleRemoveAll = (type) => {
    const fieldName = `${type}Ids`;
    
    setFormData({
      ...formData,
      [fieldName]: [],
    });

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: "",
      });
    }
  };

  // Get count of selected items
  const getSelectedCount = (type) => {
    const fieldName = `${type}Ids`;
    return formData[fieldName].length;
  };

  // Get total available count
  const getTotalCount = (type) => {
    if (type === "role") return availableRoles.filter(item => item.status === "Active").length;
    if (type === "permission") return availablePermissions.filter(item => item.status === "Active").length;
    if (type === "module") return availableModules.filter(item => item.status === "Active").length;
    return 0;
  };

  // Filter functions for search
  const getFilteredRoles = () => {
    return availableRoles
      .filter(role => role.status === "Active")
      .filter(role => 
        role.name.toLowerCase().includes(roleSearchTerm.toLowerCase())
      );
  };

  const getFilteredPermissions = () => {
    return availablePermissions
      .filter(permission => permission.status === "Active")
      .filter(permission => 
        permission.name.toLowerCase().includes(permissionSearchTerm.toLowerCase())
      );
  };

  const getFilteredModules = () => {
    return availableModules
      .filter(module => module.status === "Active")
      .filter(module => 
        module.name.toLowerCase().includes(moduleSearchTerm.toLowerCase())
      );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content user-form-modal-tabs">
        <div className="modal-header">
          {user ? (
            <h6 className="edit-user-title">
              Edit User : <span className="user-email-italic">({user.email})</span>
            </h6>
          ) : (
            <h2>Add New User</h2>
          )}
          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              type="button"
              className={`tab-btn ${activeTab === "basic" ? "active" : ""}`}
              onClick={() => setActiveTab("basic")}
            >
              Basic Info
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "roles" ? "active" : ""}`}
              onClick={() => setActiveTab("roles")}
            >
              Roles ({getSelectedCount("role")})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "permissions" ? "active" : ""}`}
              onClick={() => setActiveTab("permissions")}
            >
              Permissions ({getSelectedCount("permission")})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "modules" ? "active" : ""}`}
              onClick={() => setActiveTab("modules")}
            >
              Modules ({getSelectedCount("module")})
            </button>
          </div>

          <form onSubmit={handleSubmit} className="user-form-tabs">
            {/* Basic Information Tab */}
            {activeTab === "basic" && (
              <div className="tab-content">
                <div className="form-section">
                  <h3 className="form-section-title">Basic Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email" className="required-field">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? "error" : ""}
                        placeholder="Enter email address"
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="userName" className="required-field">Username</label>
                      <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        className={errors.userName ? "error" : ""}
                        placeholder="Enter username"
                      />
                      {errors.userName && <span className="error-text">{errors.userName}</span>}
                    </div>
                  </div>

                  {/* Password field - only show when creating new user */}
                  {!user && (
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="password" className="required-field">Password</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={errors.password ? "error" : ""}
                          placeholder="Enter password (minimum 6 characters)"
                          autoComplete="new-password"
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName" className="required-field">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? "error" : ""}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="middleName">Middle Name</label>
                      <input
                        type="text"
                        id="middleName"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        placeholder="Enter middle name (optional)"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="lastName" className="required-field">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? "error" : ""}
                        placeholder="Enter last name"
                      />
                      {errors.lastName && <span className="error-text">{errors.lastName}</span>}
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

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phoneNumber" className="required-field">Phone Number</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={errors.phoneNumber ? "error" : ""}
                        placeholder="Enter phone number"
                      />
                      {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="country" className="required-field">Country</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={errors.country ? "error" : ""}
                        placeholder="Enter country"
                      />
                      {errors.country && <span className="error-text">{errors.country}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status" className="required-field">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={errors.status ? "error" : ""}
                      >
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      {errors.status && <span className="error-text">{errors.status}</span>}
                    </div>
                  </div>

                  {/* Next Steps Information */}
                  <div className="form-info-section">
                    <div className="info-card">
                      <div className="info-header">
                        <span className="info-icon">💡</span>
                        <h4>Next Steps</h4>
                      </div>
                      <div className="info-content">
                        <p>After filling the basic information:</p>
                        <ul>
                          <li><strong>Roles tab:</strong> Assign at least one role (required)</li>
                          <li><strong>Permissions tab:</strong> Select specific permissions (optional)</li>
                          <li><strong>Modules tab:</strong> Choose accessible modules (optional)</li>
                        </ul>
                        <p className="info-note">
                          <span className="required-indicator">*</span>{" "}
                          {!user ? (
                            "Password and at least one role must be assigned before creating the user."
                          ) : (
                            "At least one role must be assigned before updating the user."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === "roles" && (
              <div className="tab-content">
                <div className="form-section">
                  {/* Search Box for Roles - NO CONTAINER */}
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search roles... (Press Esc to clear)"
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setRoleSearchTerm('');
                      }
                    }}
                  />
                  {roleSearchTerm && (
                    <button 
                      type="button"
                      className="clear-search-btn" 
                      onClick={() => setRoleSearchTerm('')}
                    >
                      ×
                    </button>
                  )}
                  
                  {/* Counts Display with Buttons on same line */}
                  <div className="counts-with-buttons">
                    <h6>Total Roles : <span className="count-number">{getTotalCount("role")}</span> Selected : <span className="count-number">{getSelectedCount("role")}</span></h6>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-assign-all"
                        onClick={() => handleAssignAll("role")}
                        disabled={getSelectedCount("role") === getTotalCount("role")}
                      >
                        Assign All
                      </button>
                      <button
                        type="button"
                        className="btn-remove-all"
                        onClick={() => handleRemoveAll("role")}
                        disabled={getSelectedCount("role") === 0}
                      >
                        Remove All
                      </button>
                    </div>
                  </div>
                  
                  {errors.roleIds && <span className="error-text">{errors.roleIds}</span>}
                  
                  <div className="selection-grid">
                    {getFilteredRoles().map((role) => (
                      <div
                        key={role.id}
                        className={`checkbox-item ${
                          formData.roleIds.includes(role.id) ? "selected" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`role-${role.id}`}
                          checked={formData.roleIds.includes(role.id)}
                          onChange={(e) =>
                            handleCheckboxChange("role", role.id, e.target.checked)
                          }
                        />
                        <label htmlFor={`role-${role.id}`} className="checkbox-label">
                          {role.name}
                        </label>
                      </div>
                    ))}
                    {getFilteredRoles().length === 0 && roleSearchTerm && (
                      <div className="no-results">
                        No roles found matching "{roleSearchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === "permissions" && (
              <div className="tab-content">
                <div className="form-section">
                  {/* Search Box for Permissions - NO CONTAINER */}
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search permissions... (Press Esc to clear)"
                    value={permissionSearchTerm}
                    onChange={(e) => setPermissionSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setPermissionSearchTerm('');
                      }
                    }}
                  />
                  {permissionSearchTerm && (
                    <button 
                      type="button"
                      className="clear-search-btn" 
                      onClick={() => setPermissionSearchTerm('')}
                    >
                      ×
                    </button>
                  )}
                  
                  {/* Counts Display with Buttons on same line */}
                  <div className="counts-with-buttons">
                    <h6>Total Permissions : <span className="count-number">{getTotalCount("permission")}</span> Selected : <span className="count-number">{getSelectedCount("permission")}</span></h6>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-assign-all"
                        onClick={() => handleAssignAll("permission")}
                        disabled={getSelectedCount("permission") === getTotalCount("permission")}
                      >
                        Assign All
                      </button>
                      <button
                        type="button"
                        className="btn-remove-all"
                        onClick={() => handleRemoveAll("permission")}
                        disabled={getSelectedCount("permission") === 0}
                      >
                        Remove All
                      </button>
                    </div>
                  </div>
                  
                  {errors.permissionIds && <span className="error-text">{errors.permissionIds}</span>}
                  
                  <div className="selection-grid">
                    {getFilteredPermissions().map((permission) => (
                      <div
                        key={permission.id}
                        className={`checkbox-item ${
                          formData.permissionIds.includes(permission.id) ? "selected" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`permission-${permission.id}`}
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={(e) =>
                            handleCheckboxChange("permission", permission.id, e.target.checked)
                          }
                        />
                        <label htmlFor={`permission-${permission.id}`} className="checkbox-label">
                          {permission.name}
                        </label>
                      </div>
                    ))}
                    {getFilteredPermissions().length === 0 && permissionSearchTerm && (
                      <div className="no-results">
                        No permissions found matching "{permissionSearchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modules Tab */}
            {activeTab === "modules" && (
              <div className="tab-content">
                <div className="form-section">
                  {/* Search Box for Modules - NO CONTAINER */}
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search modules... (Press Esc to clear)"
                    value={moduleSearchTerm}
                    onChange={(e) => setModuleSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setModuleSearchTerm('');
                      }
                    }}
                  />
                  {moduleSearchTerm && (
                    <button 
                      type="button"
                      className="clear-search-btn" 
                      onClick={() => setModuleSearchTerm('')}
                    >
                      ×
                    </button>
                  )}
                  
                  {/* Counts Display with Buttons on same line */}
                  <div className="counts-with-buttons">
                    <h6>Total Modules : <span className="count-number">{getTotalCount("module")}</span> Selected : <span className="count-number">{getSelectedCount("module")}</span></h6>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-assign-all"
                        onClick={() => handleAssignAll("module")}
                        disabled={getSelectedCount("module") === getTotalCount("module")}
                      >
                        Assign All
                      </button>
                      <button
                        type="button"
                        className="btn-remove-all"
                        onClick={() => handleRemoveAll("module")}
                        disabled={getSelectedCount("module") === 0}
                      >
                        Remove All
                      </button>
                    </div>
                  </div>
                  
                  <div className="selection-grid">
                    {getFilteredModules().map((module) => (
                      <div
                        key={module.id}
                        className={`checkbox-item ${
                          formData.moduleIds.includes(module.id) ? "selected" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`module-${module.id}`}
                          checked={formData.moduleIds.includes(module.id)}
                          onChange={(e) =>
                            handleCheckboxChange("module", module.id, e.target.checked)
                          }
                        />
                        <label htmlFor={`module-${module.id}`} className="checkbox-label">
                          {module.name}
                        </label>
                      </div>
                    ))}
                    {getFilteredModules().length === 0 && moduleSearchTerm && (
                      <div className="no-results">
                        No modules found matching "{moduleSearchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${user ? "btn-update" : "btn-save"} ${loading ? "btn-loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {getButtonText(loading, user)}
          </button>
        </div>
      </div>
    </div>
  );
};

// User View Modal
export const UserViewModal = ({ isOpen, onClose, user }) => {
  // Add body class management for blur effect
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

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

  const getFullName = () => {
    if (user.fullName) return user.fullName;
    const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "N/A";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-view-modal">
        <div className="modal-header">
          <div className="header-content">
            <h2>User Profile</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="user-details">
            {/* Personal Information */}
            <div className="detail-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                <div className="section-icon">👤</div>
              </div>
              <div className="detail-rows">
                <div className="detail-row">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{getFullName()}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Username</div>
                  <div className="detail-value">{user.userName || "N/A"}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Email Address</div>
                  <div className="detail-value">{user.email}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Created By</div>
                  <div className="detail-value">{user.createdBy && user.createdBy.trim() !== '' ? user.createdBy : 'N/A'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Modified By</div>
                  <div className="detail-value">{user.modifiedBy && user.modifiedBy.trim() !== '' ? user.modifiedBy : 'N/A'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value">{user.phoneNumber || "N/A"}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Gender</div>
                  <div className="detail-value">{user.gender || "N/A"}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Country</div>
                  <div className="detail-value">{user.country || "N/A"}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Account Status</div>
                  <div className="detail-value">
                    <span className={`status ${user.status?.toLowerCase()}`}>
                      {user.status || "Unknown"}
                    </span>
                  </div>
                </div>
                {(user.createdAt || user.createdDate) && (
                  <div className="detail-row">
                    <div className="detail-label">Created Date</div>
                    <div className="detail-value">
                      {formatDate(user.createdAt || user.createdDate)}
                    </div>
                  </div>
                )}
                {(user.updatedAt || user.modifiedDate || user.lastModified) && (
                  <div className="detail-row">
                    <div className="detail-label">Last Modified</div>
                    <div className="detail-value">
                      {formatDate(user.updatedAt || user.modifiedDate || user.lastModified)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Access Control */}
            <div className="detail-section">
              <div className="section-header">
                <h3>Access Control</h3>
                <div className="section-icon">🔐</div>
              </div>
              
              {/* Roles */}
              <div className="access-subsection">
                <div className="subsection-header">
                  <h4>Assigned Roles</h4>
                  <span className="count-badge">
                    {user.roles?.length || 0}
                  </span>
                </div>
                <div className="badges-display">
                  {user.roles?.length > 0 ? (
                    user.roles.map((role, index) => (
                      <span key={`role-${index}-${role}`} className="role-badge">
                        {role}
                      </span>
                    ))
                  ) : (
                    <div className="no-data">No roles assigned</div>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className="access-subsection">
                <div className="subsection-header">
                  <h4>Permissions</h4>
                  <span className="count-badge">
                    {user.permissions?.length || 0}
                  </span>
                </div>
                <div className="badges-display">
                  {user.permissions?.length > 0 ? (
                    user.permissions.map((permission, index) => (
                      <span key={`permission-${index}-${permission}`} className="permission-badge">
                        {permission}
                      </span>
                    ))
                  ) : (
                    <div className="no-data">No permissions assigned</div>
                  )}
                </div>
              </div>

              {/* Modules */}
              <div className="access-subsection">
                <div className="subsection-header">
                  <h4>Accessible Modules</h4>
                  <span className="count-badge">
                    {user.modules?.length || 0}
                  </span>
                </div>
                <div className="badges-display">
                  {user.modules?.length > 0 ? (
                    user.modules.map((module, index) => (
                      <span key={`module-${index}-${module}`} className="module-badge">
                        {module}
                      </span>
                    ))
                  ) : (
                    <div className="no-data">No modules assigned</div>
                  )}
                </div>
              </div>
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

// Delete Confirmation Modal
export const DeleteConfirmModal = ({ isOpen, onClose, user, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  // Add body class management for blur effect
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (user) {
      setLoading(true);
      try {
        await onConfirm(user.id);
      } catch (error) {
        console.error("Error deleting user:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>Confirm Delete</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-content">
            <div className="warning-icon">⚠️</div>
            <h3>Delete User</h3>
            <p>Are you sure you want to delete this user?</p>
            <p><strong>{user.fullName || user.email}</strong></p>
            <div className="warning-text">
              This action cannot be undone. All user data will be permanently removed.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`btn-delete ${loading ? "btn-loading" : ""}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Single User Assignment Modal
export const CommonAssignModal = ({ isOpen, onClose, user, onSave }) => {
  const [activeTab, setActiveTab] = useState("roles");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    roleIds: [],
    permissionIds: [],
    moduleIds: [],
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchAssignmentData();
      setFormData({
        roleIds: user.roleIds || [],
        permissionIds: user.permissionIds || [],
        moduleIds: user.moduleIds || [],
      });
      setSearchTerm(""); // Clear search when modal opens
    }
  }, [isOpen, user]);

  // Clear search when tab changes
  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch roles
      const rolesResponse = await fetch("https://localhost:7777/gateway/Roles/get-all-role");
      const rolesResult = await rolesResponse.json();
      console.log("Roles API Response:", rolesResult);
      if (rolesResult.success) {
        setAvailableRoles(rolesResult.data || []);
        console.log("Available Roles:", rolesResult.data);
      } else {
        console.error("Roles API Error:", rolesResult.message);
      }

      // Fetch permissions - Updated endpoint
      const permissionsResponse = await fetch("https://localhost:7777/gateway/Permissions/permissions-all");
      const permissionsResult = await permissionsResponse.json();
      console.log("Permissions API Response:", permissionsResult);
      if (permissionsResult.success) {
        setAvailablePermissions(permissionsResult.data || []);
        console.log("Available Permissions:", permissionsResult.data);
      } else {
        console.error("Permissions API Error:", permissionsResult.message);
      }

      // Fetch modules - Updated endpoint
      const modulesResponse = await fetch("https://localhost:7777/gateway/Module/getall-module");
      const modulesResult = await modulesResponse.json();
      console.log("Modules API Response:", modulesResult);
      if (modulesResult.success) {
        setAvailableModules(modulesResult.data || []);
        console.log("Available Modules:", modulesResult.data);
      } else {
        console.error("Modules API Error:", modulesResult.message);
      }
    } catch (error) {
      console.error("Error fetching assignment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(itemId)
        ? prev[type].filter(id => id !== itemId)
        : [...prev[type], itemId]
    }));
  };

  const handleAssignAll = (type) => {
    const { items } = getCurrentItems();
    const allIds = items.map(item => item.id);
    
    setFormData(prev => ({
      ...prev,
      [type]: [...new Set([...prev[type], ...allIds])]
    }));
  };

  const handleRemoveAll = (type) => {
    const { items } = getCurrentItems();
    const itemIds = items.map(item => item.id);
    
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(id => !itemIds.includes(id))
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(user.id, formData);
      onClose();
    } catch (error) {
      console.error("Error saving assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Filter items based on search term
  const getFilteredItems = (items, searchTerm) => {
    if (!searchTerm.trim()) {
      return items;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return items.filter(item => {
      const name = (item.name || "").toLowerCase();
      const description = (item.description || "").toLowerCase();
      const action = (item.action || "").toLowerCase();
      
      return name.includes(lowerSearchTerm) || 
             description.includes(lowerSearchTerm) || 
             action.includes(lowerSearchTerm);
    });
  };

  const getCurrentItems = () => {
    let items = [];
    let assignedIds = [];
    
    if (activeTab === "roles") {
      items = availableRoles;
      assignedIds = formData.roleIds;
    } else if (activeTab === "permissions") {
      items = availablePermissions;
      assignedIds = formData.permissionIds;
    } else if (activeTab === "modules") {
      items = availableModules;
      assignedIds = formData.moduleIds;
    }
    
    return {
      items: getFilteredItems(items, searchTerm),
      assignedIds,
      type: getFieldType(activeTab)
    };
  };

  const getFieldType = (tab) => {
    switch(tab) {
      case "roles": return "roleIds";
      case "permissions": return "permissionIds";
      case "modules": return "moduleIds";
      default: return "roleIds";
    }
  };

  const renderItems = (items, type, assignedIds) => {
    return items.map(item => {
      // Get name based on item type
      let itemName = "";
      let itemDescription = "";
      
      if (type === "roleIds") {
        itemName = item.name || "";
        itemDescription = item.description || "Role access permissions";
      } else if (type === "permissionIds") {
        itemName = item.name || "";
        itemDescription = item.action || item.description || "Permission action";
      } else if (type === "moduleIds") {
        itemName = item.name || "";
        itemDescription = item.description || "Module functionality";
      }

      return (
        <div
          key={item.id}
          className={`assignment-item ${assignedIds.includes(item.id) ? 'assigned' : ''}`}
          onClick={() => handleItemToggle(item.id, type)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleItemToggle(item.id, type);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="item-info">
            <h4>{highlightSearchTerm(itemName)}</h4>
            <p>{highlightSearchTerm(itemDescription)}</p>
          </div>
          <div className="item-status">
            {assignedIds.includes(item.id) ? (
              <span className="status-assigned">✓ Assigned</span>
            ) : (
              <span className="status-unassigned">+ Assign</span>
            )}
          </div>
        </div>
      );
    });
  };

  // Highlight search terms in text
  const highlightSearchTerm = (text) => {
    if (!searchTerm.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return <span key={`highlight-${index}`} className="search-highlight">{part}</span>;
      }
      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content assignment-modal">
        <div className="modal-header">
          <h3>Assign to {user?.fullName}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="assignment-tabs">
          <button
            className={`tab-button ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            Roles ({formData.roleIds.length})
          </button>
          <button
            className={`tab-button ${activeTab === "permissions" ? "active" : ""}`}
            onClick={() => setActiveTab("permissions")}
          >
            Permissions ({formData.permissionIds.length})
          </button>
          <button
            className={`tab-button ${activeTab === "modules" ? "active" : ""}`}
            onClick={() => setActiveTab("modules")}
          >
            Modules ({formData.moduleIds.length})
          </button>
        </div>

        {/* Common Search Box */}
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder={`Search ${activeTab}... (Press Esc to clear)`}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={clearSearch}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Search Results Count */}
        {searchTerm && (
          <div className="search-results-count">
            {(() => {
              const { items } = getCurrentItems();
              return `${items.length} ${activeTab} found matching "${searchTerm}"`;
            })()}
          </div>
        )}

        <div className="tab-content">
          {activeTab === "roles" && (
            <div className="assignment-section">
              <div className="section-header">
                <h4>Available Roles</h4>
                <div className="bulk-actions">
                  <button
                    className="btn-bulk-action"
                    onClick={() => handleAssignAll("roleIds")}
                    disabled={loading}
                  >
                    Assign All
                  </button>
                  <button
                    className="btn-bulk-action remove"
                    onClick={() => handleRemoveAll("roleIds")}
                    disabled={loading}
                  >
                    Remove All
                  </button>
                </div>
              </div>
              <div className="assignment-grid">
                {loading ? (
                  <div className="loading">Loading roles...</div>
                ) : (
                  (() => {
                    const { items, assignedIds, type } = getCurrentItems();
                    return items.length > 0 ? (
                      renderItems(items, type, assignedIds)
                    ) : (
                      <div className="no-results">
                        {searchTerm ? `No roles found matching "${searchTerm}"` : "No roles available"}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="assignment-section">
              <div className="section-header">
                <h4>Available Permissions</h4>
                <div className="bulk-actions">
                  <button
                    className="btn-bulk-action"
                    onClick={() => handleAssignAll("permissionIds")}
                    disabled={loading}
                  >
                    Assign All
                  </button>
                  <button
                    className="btn-bulk-action remove"
                    onClick={() => handleRemoveAll("permissionIds")}
                    disabled={loading}
                  >
                    Remove All
                  </button>
                </div>
              </div>
              <div className="assignment-grid">
                {loading ? (
                  <div className="loading">Loading permissions...</div>
                ) : (
                  (() => {
                    const { items, assignedIds, type } = getCurrentItems();
                    return items.length > 0 ? (
                      renderItems(items, type, assignedIds)
                    ) : (
                      <div className="no-results">
                        {searchTerm ? `No permissions found matching "${searchTerm}"` : "No permissions available"}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {activeTab === "modules" && (
            <div className="assignment-section">
              <div className="section-header">
                <h4>Available Modules</h4>
                <div className="bulk-actions">
                  <button
                    className="btn-bulk-action"
                    onClick={() => handleAssignAll("moduleIds")}
                    disabled={loading}
                  >
                    Assign All
                  </button>
                  <button
                    className="btn-bulk-action remove"
                    onClick={() => handleRemoveAll("moduleIds")}
                    disabled={loading}
                  >
                    Remove All
                  </button>
                </div>
              </div>
              <div className="assignment-grid">
                {loading ? (
                  <div className="loading">Loading modules...</div>
                ) : (
                  (() => {
                    const { items, assignedIds, type } = getCurrentItems();
                    return items.length > 0 ? (
                      renderItems(items, type, assignedIds)
                    ) : (
                      <div className="no-results">
                        {searchTerm ? `No modules found matching "${searchTerm}"` : "No modules available"}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn-save ${loading ? "btn-loading" : ""}`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
