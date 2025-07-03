// API Configuration
export const API_CONFIG = {
  // Base URLs for different environments
  DEVELOPMENT: "/api/", // Use proxy in development
  //DEVELOPMENT: "https://localhost:7777/", // Direct to backend since CORS is configured
  PRODUCTION: "https://your-api-domain.com/",
  STAGING: "https://staging-api-domain.com/",

  // Current environment
  CURRENT: "/api/",

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Authentication
  TOKEN_KEY: "authToken",
  REFRESH_TOKEN_KEY: "refreshToken",

  // Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "auth/login",
    LOGOUT: "auth/logout",
    REFRESH: "auth/refresh",
    ME: "auth/me",
    REGISTER: "auth/register",
    FORGOT_PASSWORD: "auth/forgot-password",
    RESET_PASSWORD: "auth/reset-password",
    VERIFY_EMAIL: "auth/verify-email",
  },

  // Users Management
  USERS: {
    BASE: "gateway/users",
    LIST: "gateway/users/get-all-user",
    CREATE: "gateway/users/create",
    GET: (id) => `gateway/users/${id}`,
    UPDATE: (id) => `gateway/users/update/${id}`,
    DELETE: (id) => `gateway/users/delete/${id}`,
    ROLES: (id) => `gateway/users/${id}/roles`,
    PERMISSIONS: (id) => `gateway/users/${id}/permissions`,
    MODULES: (id) => `gateway/users/${id}/modules`,
    STATUS: (id) => `gateway/users/${id}/status`,
    BULK: "gateway/users/bulk",
    STATS: "gateway/users/stats",
    SEARCH: "gateway/users/search",
    EXPORT: "gateway/users/export",
    IMPORT: "gateway/users/import",
  },

  // Roles Management
  ROLES: {
    BASE: "roles",
    LIST: "roles",
    CREATE: "roles",
    GET: (id) => `roles/${id}`,
    UPDATE: (id) => `roles/${id}`,
    DELETE: (id) => `roles/${id}`,
    PERMISSIONS: (id) => `roles/${id}/permissions`,
  },

  // Permissions Management
  PERMISSIONS: {
    BASE: "permissions",
    LIST: "permissions",
    CREATE: "permissions",
    GET: (id) => `permissions/${id}`,
    UPDATE: (id) => `permissions/${id}`,
    DELETE: (id) => `permissions/${id}`,
  },

  // Modules Management
  MODULES: {
    BASE: "modules",
    LIST: "modules",
    CREATE: "modules",
    GET: (id) => `modules/${id}`,
    UPDATE: (id) => `modules/${id}`,
    DELETE: (id) => `modules/${id}`,
  },

  // Employees Management
  EMPLOYEES: {
    BASE: "employees",
    LIST: "employees",
    CREATE: "employees",
    GET: (id) => `employees/${id}`,
    UPDATE: (id) => `employees/${id}`,
    DELETE: (id) => `employees/${id}`,
    STATS: "employees/stats",
  },

  // Dashboard & Analytics
  DASHBOARD: {
    STATS: "dashboard/stats",
    CHARTS: "dashboard/charts",
    RECENT_ACTIVITY: "dashboard/recent-activity",
  },

  // Settings
  SETTINGS: {
    GENERAL: "settings/general",
    SECURITY: "settings/security",
    NOTIFICATIONS: "settings/notifications",
    INTEGRATIONS: "settings/integrations",
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "Authentication required. Please log in.",
  FORBIDDEN:
    "Access denied. You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: "User created successfully!",
  USER_UPDATED: "User updated successfully!",
  USER_DELETED: "User deleted successfully!",
  ROLE_ASSIGNED: "Roles updated successfully!",
  PERMISSIONS_UPDATED: "Permissions updated successfully!",
  MODULES_UPDATED: "Modules updated successfully!",
  STATUS_UPDATED: "Status updated successfully!",
};

// Default pagination settings
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Filter options
export const FILTER_OPTIONS = {
  USER_STATUS: [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended" },
  ],

  SORT_OPTIONS: [
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "createdAt", label: "Created Date" },
    { value: "lastLogin", label: "Last Login" },
    { value: "status", label: "Status" },
  ],

  SORT_ORDER: [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ],
};

export default {
  API_CONFIG,
  ENDPOINTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  FILTER_OPTIONS,
};
