import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  userAPI,
  authAPI,
  roleAPI,
  permissionAPI,
  moduleAPI,
  handleApiError,
} from "../services/api";

// RBAC Context
const RBACContext = createContext();

// Available permissions (these can be fetched from API)
export const PERMISSIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  MANAGE_PERMISSIONS: "manage_permissions",
  MANAGE_MODULES: "manage_modules",
  VIEW_REPORTS: "view_reports",
  SYSTEM_ADMIN: "system_admin",
};

// Default roles (these can be fetched from API)
export const DEFAULT_ROLES = {
  SUPERADMIN: {
    name: "SuperAdmin",
    permissions: Object.values(PERMISSIONS),
    color: "#e74c3c",
    description: "Full system access",
  },
  ADMIN: {
    name: "Admin",
    permissions: [
      PERMISSIONS.CREATE,
      PERMISSIONS.READ,
      PERMISSIONS.UPDATE,
      PERMISSIONS.DELETE,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_ROLES,
    ],
    color: "#3498db",
    description: "Administrative access",
  },
  MANAGER: {
    name: "Manager",
    permissions: [
      PERMISSIONS.CREATE,
      PERMISSIONS.READ,
      PERMISSIONS.UPDATE,
      PERMISSIONS.VIEW_REPORTS,
    ],
    color: "#f39c12",
    description: "Management access",
  },
  EMPLOYEE: {
    name: "Employee",
    permissions: [PERMISSIONS.READ],
    color: "#27ae60",
    description: "Basic employee access",
  },
};

// Default modules (these can be fetched from API)
export const DEFAULT_MODULES = {
  USER_MANAGEMENT: {
    name: "User Management",
    permissions: ["manage_users", "create", "read", "update", "delete"],
    description: "Manage system users",
  },
  ROLE_MANAGEMENT: {
    name: "Role Management",
    permissions: ["manage_roles", "create", "read", "update", "delete"],
    description: "Manage user roles",
  },
  PERMISSION_MANAGEMENT: {
    name: "Permission Management",
    permissions: ["manage_permissions", "create", "read", "update", "delete"],
    description: "Manage system permissions",
  },
  MODULE_MANAGEMENT: {
    name: "Module Management",
    permissions: ["manage_modules", "create", "read", "update", "delete"],
    description: "Manage system modules",
  },
  REPORTS: {
    name: "Reports",
    permissions: ["view_reports", "read"],
    description: "View system reports",
  },
};

// Demo users data (fallback when API is unavailable)
const demoUsers = [
  {
    id: 1,
    fullName: "John Smith",
    email: "john.smith@company.com",
    role: "Admin",
    status: "Active",
    roles: ["ADMIN"],
    permissions: DEFAULT_ROLES.ADMIN.permissions,
    modules: Object.keys(DEFAULT_MODULES),
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
  },
  {
    id: 2,
    fullName: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Manager",
    status: "Active",
    roles: ["MANAGER"],
    permissions: DEFAULT_ROLES.MANAGER.permissions,
    modules: ["USER_MANAGEMENT", "REPORTS"],
    createdAt: "2024-01-16",
    lastLogin: "2024-01-19",
  },
  {
    id: 3,
    fullName: "Mike Davis",
    email: "mike.davis@company.com",
    role: "Employee",
    status: "Active",
    roles: ["EMPLOYEE"],
    permissions: DEFAULT_ROLES.EMPLOYEE.permissions,
    modules: ["REPORTS"],
    createdAt: "2024-01-17",
    lastLogin: "2024-01-18",
  },
  {
    id: 4,
    fullName: "Emily Wilson",
    email: "emily.wilson@company.com",
    role: "Manager",
    status: "Inactive",
    roles: ["MANAGER"],
    permissions: DEFAULT_ROLES.MANAGER.permissions,
    modules: ["USER_MANAGEMENT"],
    createdAt: "2024-01-18",
    lastLogin: "2024-01-15",
  },
];

// RBAC Provider Component
export const RBACProvider = ({ children }) => {
  // State management
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [permissions, setPermissions] = useState(PERMISSIONS);
  const [modules, setModules] = useState(DEFAULT_MODULES);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      // Try to load users from API, fallback to demo data
      await loadUsers();
    } catch (error) {
      console.log("API unavailable, using demo data");
      setUsers(demoUsers);
    } finally {
      setLoading(false);
    }
  };

  // Load users from API
  const loadUsers = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers({
        search: searchTerm,
        role: filterRole,
        status: filterStatus,
        ...filters,
      });

      // Handle different response formats
      const usersData = response.data || response.users || response;
      setUsers(Array.isArray(usersData) ? usersData : []);
      setError(null); // Clear any previous errors on success
    } catch (error) {
      console.warn("API failed, using fallback demo data:", error);

      // Fallback to demo data when API fails
      setUsers(demoUsers);
      setError(null); // Don't show error to user, just use fallback
    } finally {
      setLoading(false);
    }
  };

  // Get filtered users
  const getFilteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !filterRole || user.role === filterRole;
      const matchesStatus = !filterStatus || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Get user statistics
  const getUserStats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.status === "Active").length;
    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }, [users]);

  // User CRUD operations
  const addUser = async (userData) => {
    try {
      setLoading(true);
      const response = await userAPI.createUser(userData);
      const newUser = response.data || response;

      setUsers((prevUsers) => [...prevUsers, newUser]);
      await loadUsers(); // Refresh the list
      return newUser;
    } catch (error) {
      console.error("Add user failed:", error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setLoading(true);
      const response = await userAPI.updateUser(userId, userData);
      const updatedUser = response.data || response;

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? updatedUser : user))
      );
      return updatedUser;
    } catch (error) {
      console.error("Update user failed:", error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      await userAPI.deleteUser(userId);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Delete user failed:", error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      await updateUser(userId, { ...user, status: newStatus });
    }
  };

  // Role and permission management
  const updateUserRoles = async (userId, newRoles) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      await updateUser(userId, { ...user, roles: newRoles });
    }
  };

  const updateUserPermissions = async (userId, newPermissions) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      await updateUser(userId, { ...user, permissions: newPermissions });
    }
  };

  const updateUserModules = async (userId, newModules) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      await updateUser(userId, { ...user, modules: newModules });
    }
  };

  // Available data arrays for dropdowns
  const ROLES = Object.keys(DEFAULT_ROLES);
  const STATUSES = ["Active", "Inactive"];

  // Context value
  const contextValue = {
    // Data
    users,
    currentUser,
    roles,
    permissions,
    modules,

    // Filtered data
    getFilteredUsers,
    getUserStats,

    // Filter states
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,

    // Loading states
    loading,
    error,

    // Actions
    loadUsers,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateUserRoles,
    updateUserPermissions,
    updateUserModules,

    // Constants
    ROLES,
    STATUSES,
    PERMISSIONS,
    DEFAULT_ROLES,
    DEFAULT_MODULES,
  };

  return (
    <RBACContext.Provider value={contextValue}>{children}</RBACContext.Provider>
  );
};

// Custom hook to use RBAC context
export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};

export default RBACContext;
