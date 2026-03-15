import axios from "axios";

const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

// Use Vite's local proxy during development unless an explicit API URL is provided.
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalhost
    ? "/api"
    : "https://academic-file-asscess-tracker-1.onrender.com/api");

const timeout =
  Number(import.meta.env.VITE_API_TIMEOUT_MS) ||
  (isLocalhost ? 30000 : 45000);

const instance = axios.create({
  baseURL,
  timeout,
  headers: {
    Accept: "application/json"
  }
});

// Request interceptor (attach token)
instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const requestUrl = `${error.config?.baseURL || ""}${error.config?.url || ""}`;
    const isAuthBootstrap401 =
      error.response?.status === 401 &&
      typeof error.config?.url === "string" &&
      error.config.url.includes("/auth/me");

    if (isAuthBootstrap401) {
      return Promise.reject(error);
    }

    console.error("API Error:", {
      method: error.config?.method,
      url: requestUrl,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default instance;
