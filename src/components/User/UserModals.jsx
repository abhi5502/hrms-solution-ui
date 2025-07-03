import React, { useState, useEffect } from "react";
import { useRBAC, DEFAULT_MODULES } from "../../contexts/RBACContext";
import "./UserModals.css";

// Add/Edit User Modal
export const UserFormModal = ({ isOpen, onClose, user = null, onSave }) => {
  const { ROLES } = useRBAC();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roles: [],
    permissions: [],
    modules: [],
    country: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || user.name || "",
        email: user.email || "",
        roles: user.roles || [],
        permissions: user.permissions || [],
        modules: user.modules || [],
        country: user.country || "",
        status: user.status?.toLowerCase() || "active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        roles: [],
        permissions: [],
        modules: [],
        country: "",
        status: "active",
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (formData.roles.length === 0)
      newErrors.roles = "At least one role is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";

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

  const handleRoleChange = (roleKey, checked) => {
    const newRoles = checked
      ? [...formData.roles, roleKey]
      : formData.roles.filter((r) => r !== roleKey);

    // Auto-update permissions based on roles
    const allPermissions = new Set();
    newRoles.forEach((role) => {
      ROLES[role]?.permissions.forEach((perm) => allPermissions.add(perm));
    });

    setFormData({
      ...formData,
      roles: newRoles,
      permissions: Array.from(allPermissions),
    });
  };

  const handleModuleChange = (moduleKey, checked) => {
    const newModules = checked
      ? [...formData.modules, moduleKey]
      : formData.modules.filter((m) => m !== moduleKey);

    setFormData({
      ...formData,
      modules: newModules,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content user-form-modal">
        <div className="modal-header">
          <h2>{user ? "Edit User" : "Add New User"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className={errors.country ? "error" : ""}
              >
                <option value="">Select Country</option>
                <option value="USA">USA</option>
                <option value="India">India</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
              {errors.country && (
                <span className="error-text">{errors.country}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Roles *</label>
            <div className="checkbox-grid">
              {Object.entries(ROLES).map(([key, role]) => (
                <label key={key} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(key)}
                    onChange={(e) => handleRoleChange(key, e.target.checked)}
                  />
                  <span className={`role-badge ${key.toLowerCase()}`}>
                    {role.name}
                  </span>
                </label>
              ))}
            </div>
            {errors.roles && <span className="error-text">{errors.roles}</span>}
          </div>

          <div className="form-group">
            <label>Modules</label>
            <div className="checkbox-grid">
              {Object.entries(DEFAULT_MODULES).map(([key, module]) => (
                <label key={key} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.modules.includes(module.key)}
                    onChange={(e) =>
                      handleModuleChange(module.key, e.target.checked)
                    }
                  />
                  <span className="module-badge">{module.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Auto-assigned Permissions</label>
            <div className="permissions-display">
              {formData.permissions.map((permission) => (
                <span key={permission} className="permission-badge">
                  {permission.replace("_", " ").toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {user ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Management Modal
export const RoleManagementModal = ({ isOpen, onClose, user, onSave }) => {
  const { ROLES } = useRBAC();
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || []);
    }
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, selectedRoles);
    onClose();
  };

  const toggleRole = (roleKey) => {
    setSelectedRoles((prev) =>
      prev.includes(roleKey)
        ? prev.filter((r) => r !== roleKey)
        : [...prev, roleKey]
    );
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content role-modal">
        <div className="modal-header">
          <h2>Manage Roles - {user.fullName || user.name}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="roles-list">
            {Object.entries(ROLES).map(([key, role]) => (
              <div key={key} className="role-item">
                <label className="role-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(key)}
                    onChange={() => toggleRole(key)}
                  />
                  <div className="role-info">
                    <span className={`role-name ${key.toLowerCase()}`}>
                      {role.name}
                    </span>
                    <span className="role-description">{role.description}</span>
                    <div className="role-permissions">
                      <strong>Permissions:</strong>{" "}
                      {role.permissions
                        ? role.permissions.join(", ")
                        : "No permissions"}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Update Roles
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Permission Management Modal
export const PermissionManagementModal = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const { PERMISSIONS } = useRBAC();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (user) {
      setSelectedPermissions(user.permissions || []);
    }
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, selectedPermissions);
    onClose();
  };

  const togglePermission = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content permission-modal">
        <div className="modal-header">
          <h2>Manage Permissions - {user.fullName || user.name}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="permissions-grid">
            {Object.values(PERMISSIONS).map((permission) => (
              <label key={permission} className="permission-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                />
                <span className="permission-label">
                  {permission.replace("_", " ").toUpperCase()}
                </span>
              </label>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Update Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Module Management Modal
export const ModuleManagementModal = ({ isOpen, onClose, user, onSave }) => {
  const [selectedModules, setSelectedModules] = useState([]);

  useEffect(() => {
    if (user) {
      setSelectedModules(user.modules || []);
    }
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, selectedModules);
    onClose();
  };

  const toggleModule = (moduleKey) => {
    setSelectedModules((prev) =>
      prev.includes(moduleKey)
        ? prev.filter((m) => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content module-modal">
        <div className="modal-header">
          <h2>Manage Modules - {user.fullName || user.name}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modules-grid">
            {Object.values(DEFAULT_MODULES).map((module) => (
              <label key={module.key} className="module-checkbox">
                <input
                  type="checkbox"
                  checked={selectedModules.includes(module.key)}
                  onChange={() => toggleModule(module.key)}
                />
                <span className="module-label">{module.name}</span>
              </label>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Update Modules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Details View Modal
export const UserViewModal = ({ isOpen, onClose, user }) => {
  const { ROLES } = useRBAC();

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content user-view-modal">
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="user-details">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Full Name:</label>
                <span>{user.fullName || user.name}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <label>Country:</label>
                <span>{user.country}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status ${user.status}`}>{user.status}</span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{user.createdAt}</span>
              </div>
              <div className="detail-item">
                <label>Last Login:</label>
                <span>{user.lastLogin || "Never"}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Roles</h3>
            <div className="roles-display">
              {user.roles.map((roleKey) => (
                <span
                  key={roleKey}
                  className={`role-badge ${roleKey.toLowerCase()}`}
                >
                  {ROLES[roleKey]?.name || roleKey}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>Permissions</h3>
            <div className="permissions-display">
              {user.permissions.map((permission) => (
                <span key={permission} className="permission-badge">
                  {permission.replace("_", " ").toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>Modules</h3>
            <div className="modules-display">
              {user.modules.map((moduleKey) => {
                const module = Object.values(DEFAULT_MODULES).find(
                  (m) => m.key === moduleKey
                );
                return (
                  <span key={moduleKey} className="module-badge">
                    {module?.name || moduleKey}
                  </span>
                );
              })}
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
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>Confirm Delete</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="delete-content">
          <div className="warning-icon">⚠️</div>
          <p>
            Are you sure you want to delete{" "}
            <strong>{user.fullName || user.name}</strong>?
          </p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-delete"
            onClick={() => {
              onConfirm(user.id);
              onClose();
            }}
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};
