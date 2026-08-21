import React, { createContext, useContext, useEffect, useState } from "react";
import API, { setAuthToken } from "../api/api";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1] || ""));
  } catch (e) {
    return null;
  }
}

function normalizeUser(token, tokenPayload, profileData) {
  return {
    token,
    ...(tokenPayload || {}),
    ...(profileData || {}),
    role:
      profileData?.role ||
      tokenPayload?.role ||
      tokenPayload?.user?.role ||
      profileData?.user?.role ||
      tokenPayload?.roles?.[0] ||
      profileData?.roles?.[0],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (fallbackProfile) => {
    const token =
      localStorage.getItem("syrtrip_token") || localStorage.getItem("token");
    if (!token) return null;

    const tokenPayload = decodeToken(token);
    try {
      const res = await API.get("/users/me");
      const profileData = res.data?.user || res.data || fallbackProfile || null;
      const nextUser = normalizeUser(token, tokenPayload, profileData);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      if (fallbackProfile) {
        const nextUser = normalizeUser(token, tokenPayload, fallbackProfile);
        setUser(nextUser);
        return nextUser;
      }

      const nextUser = normalizeUser(token, tokenPayload, null);
      setUser(nextUser);
      return nextUser;
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem("syrtrip_token") || localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      const tokenPayload = decodeToken(token);
      setUser(normalizeUser(token, tokenPayload, null));
      refreshUser().finally(() => setLoading(false));
      return;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const token = res.data?.token || res.data?.accessToken || null;
    if (!token) throw new Error("No token returned from server");
    setAuthToken(token);
    const tokenPayload = decodeToken(token);
    const u = normalizeUser(token, tokenPayload, null);
    setUser(u);
    const refreshedUser = await refreshUser();
    return refreshedUser || u;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
