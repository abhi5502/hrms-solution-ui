import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { userAPI, authAPI, handleApiError } from "../services/api";

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

// Default roles
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

// Default modules
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
  REPORTS: {
    name: "Reports",
    permissions: ["view_reports", "read"],
    description: "View system reports",
  },
};

// Demo users data
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
  },
];

// RBAC Provider Component
export const RBACProvider = ({ children }) => {
  // State management
  const [users, setUsers] = useState(demoUsers);
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

  // Cache and debounce refs
  const debounceTimer = useRef(null);
  const lastLoadTime = useRef(0);
  const CACHE_DURATION = 30000; // 30 seconds

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    const now = Date.now();

    // Skip if recently loaded (cache)
    if (now - lastLoadTime.current < CACHE_DURATION) {
      return;
    }

    setLoading(true);
    try {
      // Try to load users from API, fallback to demo data
      await loadUsers();
      lastLoadTime.current = now;
    } catch (error) {
      console.log("Using demo data due to API unavailability");
      setUsers(demoUsers);
    } finally {
      setLoading(false);
    }
  };

  // Load users from API with caching and error handling
  const loadUsers = async (filters = {}) => {
    // Skip if already loading
    if (loading) return;

    try {
      setLoading(true);
      const response = await userAPI.getUsers({
        search: searchTerm,
        role: filterRole,
        status: filterStatus,
        ...filters,
      });

      const usersData = response.data || response.users || response;
      setUsers(Array.isArray(usersData) ? usersData : demoUsers);
      setError(null);
    } catch (error) {
      console.log("API call failed, using demo data");
      setUsers(demoUsers);
    } finally {
      setLoading(false);
    }
  };

  // Debounced load users function
  const debouncedLoadUsers = useCallback(
    (filters = {}) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        loadUsers(filters);
      }, 300);
    },
    [searchTerm, filterRole, filterStatus]
  );

  // Get filtered users with memoization for performance
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

  // Get user stats with memoization
  const getUserStats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [users]);

  // CRUD operations (optimized)
  const addUser = async (userData) => {
    try {
      const response = await userAPI.createUser(userData);
      const newUser = response.data || response;
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (error) {
      // For demo, add locally
      const newUser = { ...userData, id: Date.now() };
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await userAPI.updateUser(userId, userData);
      const updatedUser = response.data || response;
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );
      return updatedUser;
    } catch (error) {
      // For demo, update locally
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...userData } : user
        )
      );
      return { ...userData, id: userId };
    }
  };

  const deleteUser = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      // For demo, delete locally
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const toggleUserStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      await updateUser(userId, { ...user, status: newStatus });
    }
  };

  // Role and permission management (simplified for performance)
  const updateUserRoles = async (userId, newRoles) => {
    await updateUser(userId, { roles: newRoles });
  };

  const updateUserPermissions = async (userId, newPermissions) => {
    await updateUser(userId, { permissions: newPermissions });
  };

  const updateUserModules = async (userId, newModules) => {
    await updateUser(userId, { modules: newModules });
  };

  // Available data arrays for dropdowns
  const ROLES = Object.keys(DEFAULT_ROLES);
  const STATUSES = ["Active", "Inactive"];

  // Context value with memoization to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
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
      loadUsers: debouncedLoadUsers,
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
    }),
    [
      users,
      currentUser,
      roles,
      permissions,
      modules,
      getFilteredUsers,
      getUserStats,
      searchTerm,
      filterRole,
      filterStatus,
      loading,
      error,
      debouncedLoadUsers,
    ]
  );

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
