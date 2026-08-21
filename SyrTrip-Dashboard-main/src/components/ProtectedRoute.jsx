import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || !user.token) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const userRole = (
      user?.role ||
      user?.user?.role ||
      (user?.roles && user.roles[0])
    )?.toLowerCase();
    if (!userRole || !roles.includes(userRole)) {
      if (userRole === "hotel_owner")
        return <Navigate to="/owner/dashboard" replace />;
      return (
        <div style={{ padding: 40 }}>
          غير مصرح لك، لا تملك الصلاحيات الكافية.
        </div>
      );
    }
  }

  return children;
}
