import axios from "axios";

const DEFAULT_BASE = "https://syr-trip-backend.vercel.app/api/";
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || DEFAULT_BASE,
  timeout: 20000, // يمنع التعليق الطويل
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token (if any) to every request
API.interceptors.request.use(
  (config) => {
    try {
      const token =
        localStorage.getItem("syrtrip_token") || localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Helpful debug logs
      console.log("➡️ Request:", config.method?.toUpperCase(), config.url);
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.config.url);
    return response;
  },
  (error) => {
    console.log("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

function setAuthToken(token) {
  if (token) localStorage.setItem("syrtrip_token", token);
  else localStorage.removeItem("syrtrip_token");
}

function clearAuthToken() {
  localStorage.removeItem("syrtrip_token");
  localStorage.removeItem("token");
}

function getUserRoleFromToken() {
  const token =
    localStorage.getItem("syrtrip_token") || localStorage.getItem("token");
  if (!token) return null;
  const decoded = parseJwt(token);
  if (!decoded) return null;
  // Try common shapes: { role }, { user: { role } }, { roles: [...] }
  return (
    decoded.role ||
    decoded.user?.role ||
    (Array.isArray(decoded.roles) ? decoded.roles[0] : null) ||
    null
  );
}

export { setAuthToken, clearAuthToken, getUserRoleFromToken };
export default API;
