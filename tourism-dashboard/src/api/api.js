import axios from "axios";

const API = axios.create({
  baseURL: "https://tourism-app-1-fs9e.onrender.com/api",
  timeout: 10000, // يمنع التعليق الطويل
  headers: {
    "Content-Type": "application/json",
  },
});

// (اختياري لكن مهم للتصحيح)
API.interceptors.request.use(
  (config) => {
    console.log("➡️ Request:", config.url, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.data);
    return response;
  },
  (error) => {
    console.log("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;