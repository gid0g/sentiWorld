import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage
    const token = sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Clear token and trigger logout
        sessionStorage.removeItem("access_token");
        window.dispatchEvent(new Event("unauthorized"));
      }
      return Promise.reject(error);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      return Promise.reject({
        response: {
          data: {
            detail:
              "Network error: No response from server. Please check your connection.",
          },
        },
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
      return Promise.reject({
        response: {
          data: {
            detail: "Request error: " + error.message,
          },
        },
      });
    }
  }
);

// User-specific analytics endpoints
export const getUserAnalytics = async () => {
  try {
    const response = await api.get("/analytics/user");
    return response.data;
  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    throw error;
  }
};

export const getUserFeedbackStats = async () => {
  try {
    const response = await api.get("/analytics/user/feedback-stats");
    return response.data;
  } catch (error) {
    console.error("Error in getUserFeedbackStats:", error);
    throw error;
  }
};

export const getUserSentimentDistribution = async () => {
  try {
    const response = await api.get("/analytics/user/sentiment-distribution");
    return response.data;
  } catch (error) {
    console.error("Error in getUserSentimentDistribution:", error);
    throw error;
  }
};

export const getUserMonthlyFeedback = async () => {
  try {
    const response = await api.get("/analytics/user/monthly-feedback");
    return response.data;
  } catch (error) {
    console.error("Error in getUserMonthlyFeedback:", error);
    throw error;
  }
};
export const getUserWeeklyFeedback = async () => {
  try {
    const response = await api.get("/analytics/user/weekly-feedback");
    return response.data;
  } catch (error) {
    console.error("Error in getUserMonthlyFeedback:", error);
    throw error;
  }
};

// User profile endpoints
export const getUserProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};
export const deleteUserProfile = async () => {
  try {
    const response = await api.delete("/users/delete");
    logout();
    return response.data;
  } catch (error) {
    console.error("Error in deleteUserProfile:", error);
    throw error;
  }
};

// Settings endpoints
export const getUserSettings = async () => {
  try {
    const response = await api.get("/users/settings");
    return response.data;
  } catch (error) {
    console.error("Error in getUserSettings:", error);
    throw error;
  }
};

export const updateUserSettings = async (settings) => {
  try {
    const response = await api.put("/users/settings", settings);
    return response.data;
  } catch (error) {
    console.error("Error in updateUserSettings:", error);
    throw error;
  }
};

// Authentication endpoints
export const login = async (credentials) => {
  try {
    const formData = new FormData();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.access_token) {
      sessionStorage.setItem("access_token", response.data.access_token);
    }

    return response.data;
  } catch (error) {
    console.error("Error in login:", error);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post("/auth/signup", {
      email: userData.email,
      full_name: userData.full_name,
      password: userData.password,
      organization: userData.organization,
      role: userData.role,
    });

    // Store the token
    if (response.data.access_token) {
      sessionStorage.setItem("access_token", response.data.access_token);
    }

    return response.data;
  } catch (error) {
    console.error("Error in signup:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("analysisResults");
    sessionStorage.removeItem("chartData");
    sessionStorage.removeItem("showVisualizations");
    sessionStorage.removeItem("visualizationJsons");
    sessionStorage.clear();

    return response.data;
  } catch (error) {
    console.error("Error in logout:", error);
    sessionStorage.removeItem("access_token");
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    const response = await api.get("/auth/check");
    return response.data;
  } catch (error) {
    console.error("Error in checkAuth:", error);
    sessionStorage.removeItem("access_token");
    throw error;
  }
};

export default api;
