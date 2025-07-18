// API Configuration - Centralized API endpoints

// Base API URL
const BASE_API_URL = "https://localhost:7777/gateway";

// API Endpoints Configuration
export const API_ENDPOINTS = {


 // Users API
USERS: {
  GET_ALL: `${BASE_API_URL}/Users/get-all-user`,         
  CREATE: `${BASE_API_URL}/Users/user-create`,          
  UPDATE: `${BASE_API_URL}/Users/user-update`,           
  DELETE: (id) => `${BASE_API_URL}/Users/user-delete/${id}`, 
  GET_BY_ID: (id) => `${BASE_API_URL}/Users/get-user-by-id/${id}`, 
},



  // Roles API
  ROLES: {
    GET_ALL: `${BASE_API_URL}/Roles/get-all-role`,
    CREATE: `${BASE_API_URL}/Roles/create-role`,
    UPDATE: `${BASE_API_URL}/Roles/update-role`,
    DELETE: (id) => `${BASE_API_URL}/Roles/delete-role/${id}`,
    GET_BY_ID: (id) => `${BASE_API_URL}/Roles/get-role-by-id/${id}`,
  },

  // Permissions API 
  PERMISSIONS: {
    GET_ALL: `${BASE_API_URL}/Permissions/permissions-all`,
    CREATE: `${BASE_API_URL}/Permissions/create-permission`,
    UPDATE: `${BASE_API_URL}/Permissions/update-permission`,
    DELETE: (id) => `${BASE_API_URL}/Permissions/delete/${id}`,
    GET_BY_ID: (id) => `${BASE_API_URL}/Permissions/${id}`,
  },

 // Modules API 
MODULES: {
  GET_ALL: `${BASE_API_URL}/Module/getall-module`,
  CREATE: `${BASE_API_URL}/Module/create-module`,
  UPDATE: `${BASE_API_URL}/Module/module-update`,
  DELETE: (id) => `${BASE_API_URL}/Module/delete-module/${id}`,
  GET_BY_ID: (id) => `${BASE_API_URL}/Module/get-module-by-id/${id}`,
},

  // Countries API
  COUNTRIES: {
    GET_ALL: `${BASE_API_URL}/Country/countries-all`,
    CREATE: `${BASE_API_URL}/Country/country-create`,
    UPDATE: `${BASE_API_URL}/Country/country-update`,
    DELETE: (id) => `${BASE_API_URL}/Country/country-delete/${id}`,
    GET_BY_ID: (id) => `${BASE_API_URL}/Country/country-by-id/${id}`,
  },

  // States API
  STATES: {
    GET_ALL: `${BASE_API_URL}/State/states-all`,
    CREATE: `${BASE_API_URL}/State/state-create`,
    UPDATE: `${BASE_API_URL}/State/state-update`,
    DELETE: (id) => `${BASE_API_URL}/State/state-delete/${id}`,
    GET_BY_ID: (id) => `${BASE_API_URL}/State/state-by-id/${id}`,
  },

  // Cities API
  CITIES: {
    GET_ALL: `${BASE_API_URL}/City/get-all-cities`,
    CREATE: `${BASE_API_URL}/City/city-create`,
    UPDATE: `${BASE_API_URL}/City/city-update`,
    DELETE: (id) => `${BASE_API_URL}/City/city-delete/${id}`,
    GET_BY_ID: (id) => `${BASE_API_URL}/City/get-city-by-id/${id}`,
  }
};

// API Helper Functions
export const apiHelper = {
  // Common headers
  getHeaders: () => ({
    "Content-Type": "application/json",
    ...(localStorage.getItem("token")
      ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
      : {}),
  }),

  // Common fetch wrapper with better error handling
  request: async (url, options = {}) => {
    const defaultOptions = {
      headers: apiHelper.getHeaders(),
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, defaultOptions);
      console.log(`API Response Status: ${response.status}`);
      const responseText = await response.text();
      console.log(`API Response Text:`, responseText);
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        result = { success: false, message: "Invalid JSON response" };
      }

      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return { success: false, message: "Unauthorized. Redirecting to login." };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${result.message || 'Unknown error'}`);
      }

      return result;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  },

  // GET request
  get: (url) => apiHelper.request(url, { method: "GET" }),

  // POST request
  post: (url, data) => apiHelper.request(url, {
    method: "POST",
    body: JSON.stringify(data),
  }),

  // PUT request
  put: (url, data) => apiHelper.request(url, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  // DELETE request
  delete: (url) => apiHelper.request(url, { method: "DELETE" }),
};

// Export BASE_API_URL for direct use
export { BASE_API_URL };