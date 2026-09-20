import axios from "axios";

export const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL || "http://127.0.0.1:8000/api/";
export const RENDER_API_URL = import.meta.env.VITE_RENDER_API_URL || "https://hospital-backend-ggfo.onrender.com/api/";

export const getActiveApiUrl = () => {
  const saved = localStorage.getItem("preferred_api_url");
  if (saved && (saved === LOCAL_API_URL || saved === RENDER_API_URL || saved.startsWith("http"))) {
    return saved;
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== "undefined" && envUrl !== "/") {
    return envUrl;
  }
  return LOCAL_API_URL;
};

export const setActiveApiUrl = (url) => {
  localStorage.setItem("preferred_api_url", url);
  API.defaults.baseURL = url;
};

const API = axios.create({
  baseURL: getActiveApiUrl(),
});

API.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getActiveApiUrl();
  }
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Auto-failover: If local server has a network error (connection refused / offline),
    // and we haven't already retried with Render, automatically retry with Render Cloud backend
    if (!error.response && originalRequest && !originalRequest._retryWithRender && originalRequest.baseURL !== RENDER_API_URL) {
      console.warn(`Local backend unreachable (${originalRequest.baseURL}). Seamlessly failing over to Render: ${RENDER_API_URL}`);
      originalRequest._retryWithRender = true;
      originalRequest.baseURL = RENDER_API_URL;
      return API(originalRequest);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("currentUser");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
