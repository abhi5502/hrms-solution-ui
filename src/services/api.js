import {
  API_CONFIG,
  ENDPOINTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from "../config/apiConfig";

// HTTP client with error handling
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.CURRENT;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;

    // Debug the base URL being used
    console.log("🏗️ ApiClient initialized with:", {
      baseURL: this.baseURL,
      apiConfig: API_CONFIG,
      current: API_CONFIG.CURRENT,
    });
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem(API_CONFIG.TOKEN_KEY);
  }

  // Set auth token
  setAuthToken(token) {
    localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
  }

  // Get headers with auth token
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Debug logging
    console.log("🔗 API Request:", {
      baseURL: this.baseURL,
      endpoint: endpoint,
      fullURL: url,
      method: options.method || "GET",
      isRelativeURL: this.baseURL.startsWith("/"),
      location: window.location.origin,
    });

    const config = {
      headers: this.getHeaders(options.headers),
      ...options,
    };

    console.log("📤 Request Config:", {
      url,
      method: config.method || "GET",
      headers: config.headers,
    });

    try {
      const response = await fetch(url, config);

      console.log(
        "✅ API Response Status:",
        response.status,
        response.statusText
      );

      // Handle different response status codes
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        // Unauthorized - redirect to login or refresh token
        this.removeAuthToken();
        window.location.href = "/login";
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      if (response.status === HTTP_STATUS.FORBIDDEN) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      }

      if (response.status === HTTP_STATUS.NOT_FOUND) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle empty responses (like DELETE)
      if (response.status === HTTP_STATUS.NO_CONTENT) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("❌ API Request Failed:", {
        endpoint,
        fullURL: url,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    // Build query string manually for relative URLs
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";
    const fullEndpoint = endpoint + queryString;

    console.log("🔧 GET Request Details:", {
      endpoint,
      params,
      queryString,
      fullEndpoint,
      baseURL: this.baseURL,
    });

    return this.request(fullEndpoint, {
      method: "GET",
    });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// User API service
export const userAPI = {
  // Get all users with optional filters
  async getUsers(filters = {}) {
    const params = {
      search: filters.search || "",
      role: filters.role || "",
      status: filters.status || "",
      page: filters.page || 1,
      limit: filters.limit || 50,
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    };

    return apiClient.get(ENDPOINTS.USERS.LIST, params);
  },

  // Get single user by ID
  async getUserById(userId) {
    return apiClient.get(ENDPOINTS.USERS.GET(userId));
  },

  // Create new user
  async createUser(userData) {
    return apiClient.post(ENDPOINTS.USERS.CREATE, userData);
  },

  // Update user
  async updateUser(userId, userData) {
    return apiClient.put(ENDPOINTS.USERS.UPDATE(userId), userData);
  },

  // Partially update user
  async patchUser(userId, updates) {
    return apiClient.patch(ENDPOINTS.USERS.UPDATE(userId), updates);
  },

  // Delete user
  async deleteUser(userId) {
    return apiClient.delete(ENDPOINTS.USERS.DELETE(userId));
  },

  // Update user roles
  async updateUserRoles(userId, roles) {
    return apiClient.patch(ENDPOINTS.USERS.ROLES(userId), { roles });
  },

  // Update user permissions
  async updateUserPermissions(userId, permissions) {
    return apiClient.patch(ENDPOINTS.USERS.PERMISSIONS(userId), {
      permissions,
    });
  },

  // Update user modules
  async updateUserModules(userId, modules) {
    return apiClient.patch(ENDPOINTS.USERS.MODULES(userId), { modules });
  },

  // Toggle user status (active/inactive)
  async toggleUserStatus(userId, status) {
    return apiClient.patch(ENDPOINTS.USERS.STATUS(userId), { status });
  },

  // Bulk operations
  async bulkUpdateUsers(userIds, updates) {
    return apiClient.patch(ENDPOINTS.USERS.BULK, { userIds, updates });
  },

  async bulkDeleteUsers(userIds) {
    return apiClient.delete(ENDPOINTS.USERS.BULK, { userIds });
  },

  // Get user statistics - Endpoint not available, calculated in frontend
  // async getUserStats() {
  //   return apiClient.get(ENDPOINTS.USERS.STATS);
  // },
};

// Authentication API service
export const authAPI = {
  // Login user
  async login(credentials) {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    return response;
  },

  // Refresh token
  async refreshToken() {
    const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH);
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    return response;
  },

  // Logout
  async logout() {
    apiClient.removeAuthToken();
    // Optional: call logout endpoint to invalidate token on server
    // return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  // Get current user
  async getCurrentUser() {
    return apiClient.get(ENDPOINTS.AUTH.ME);
  },
};

// Roles API service
export const roleAPI = {
  async getRoles() {
    return apiClient.get(ENDPOINTS.ROLES.LIST);
  },

  async createRole(roleData) {
    return apiClient.post(ENDPOINTS.ROLES.CREATE, roleData);
  },

  async updateRole(roleId, roleData) {
    return apiClient.put(ENDPOINTS.ROLES.UPDATE(roleId), roleData);
  },

  async deleteRole(roleId) {
    return apiClient.delete(ENDPOINTS.ROLES.DELETE(roleId));
  },
};

// Permissions API service
export const permissionAPI = {
  async getPermissions() {
    return apiClient.get(ENDPOINTS.PERMISSIONS.LIST);
  },

  async createPermission(permissionData) {
    return apiClient.post(ENDPOINTS.PERMISSIONS.CREATE, permissionData);
  },

  async updatePermission(permissionId, permissionData) {
    return apiClient.put(
      ENDPOINTS.PERMISSIONS.UPDATE(permissionId),
      permissionData
    );
  },

  async deletePermission(permissionId) {
    return apiClient.delete(ENDPOINTS.PERMISSIONS.DELETE(permissionId));
  },
};

// Modules API service
export const moduleAPI = {
  async getModules() {
    return apiClient.get(ENDPOINTS.MODULES.LIST);
  },

  async createModule(moduleData) {
    return apiClient.post(ENDPOINTS.MODULES.CREATE, moduleData);
  },

  async updateModule(moduleId, moduleData) {
    return apiClient.put(ENDPOINTS.MODULES.UPDATE(moduleId), moduleData);
  },

  async deleteModule(moduleId) {
    return apiClient.delete(ENDPOINTS.MODULES.DELETE(moduleId));
  },
};

// Error handler utility
export const handleApiError = (error) => {
  if (error.message.includes("Authentication required")) {
    // Redirect to login
    window.location.href = "/login";
  } else if (error.message.includes("Access forbidden")) {
    // Show access denied message
    alert("Access denied: You do not have permission to perform this action");
  } else if (error.message.includes("Network")) {
    // Handle network errors
    alert("Network error: Please check your connection and try again");
  } else {
    // Generic error
    alert(`Error: ${error.message}`);
  }

  console.error("API Error:", error);
};

// Export API client for direct use if needed
export { apiClient };

export default {
  user: userAPI,
  auth: authAPI,
  role: roleAPI,
  permission: permissionAPI,
  module: moduleAPI,
  handleError: handleApiError,
};
