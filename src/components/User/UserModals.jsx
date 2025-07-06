/* eslint-disable react/prop-types */
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

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content user-form-modal">
        <div className="modal-header">
          <h2>{user ? "Edit User" : "Add New User"}</h2>
          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="user-form">
            {/* Basic Information Section */}
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
              </div>

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
            </div>

            {/* Roles Section */}
            <div className="form-section">
              <h3 className="form-section-title">Roles *</h3>
              {errors.roleIds && <span className="error-text">{errors.roleIds}</span>}
              
              <div className="selection-grid">
                {availableRoles.map((role) => (
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
              </div>
            </div>

            {/* Permissions Section */}
            <div className="form-section">
              <h3 className="form-section-title">Permissions</h3>
              
              <div className="selection-grid">
                {availablePermissions.map((permission) => (
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
              </div>
            </div>

            {/* Modules Section */}
            <div className="form-section">
              <h3 className="form-section-title">Modules</h3>
              
              <div className="selection-grid">
                {availableModules.map((module) => (
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
              </div>
            </div>
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
            {/* eslint-disable-next-line no-nested-ternary */}
            {loading ? "Saving..." : (user ? "Update User" : "Create User")}
          </button>
        </div>
      </div>
    </div>
  );
};

// User View Modal
export const UserViewModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content user-view-modal">
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="user-details">
            {/* Personal Information */}
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>Full Name</label>
                  <span>{user.fullName || `${user.firstName} ${user.lastName}`}</span>
                </div>
                <div className="detail-item">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>Email</label>
                  <span>{user.email}</span>
                </div>
                <div className="detail-item">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>Phone</label>
                  <span>{user.phoneNumber || "N/A"}</span>
                </div>
                <div className="detail-item">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>Gender</label>
                  <span>{user.gender || "N/A"}</span>
                </div>
                <div className="detail-item">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>Country</label>
                  <span>{user.country || "N/A"}</span>
                </div>
                <div className="detail-item">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>Status</label>
                  <span className={`status ${user.status?.toLowerCase()}`}>
                    {user.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="detail-section">
              <h3>Assigned Roles</h3>
              <div className="badges-display">
                {user.roles?.length > 0 ? (
                  user.roles.map((role, index) => (
                    <span key={`role-${index}-${role}`} className="role-badge">
                      {role}
                    </span>
                  ))
                ) : (
                  <span>No roles assigned</span>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="detail-section">
              <h3>Permissions</h3>
              <div className="badges-display">
                {user.permissions?.length > 0 ? (
                  user.permissions.map((permission, index) => (
                    <span key={`permission-${index}-${permission}`} className="permission-badge">
                      {permission}
                    </span>
                  ))
                ) : (
                  <span>No permissions assigned</span>
                )}
              </div>
            </div>

            {/* Modules */}
            <div className="detail-section">
              <h3>Accessible Modules</h3>
              <div className="badges-display">
                {user.modules?.length > 0 ? (
                  user.modules.map((module, index) => (
                    <span key={`module-${index}-${module}`} className="module-badge">
                      {module}
                    </span>
                  ))
                ) : (
                  <span>No modules assigned</span>
                )}
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
      type: activeTab === "roles" ? "roleIds" : 
            activeTab === "permissions" ? "permissionIds" : "moduleIds"
    };
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
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="search-highlight">{part}</span>
      ) : (
        part
      )
    );
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
