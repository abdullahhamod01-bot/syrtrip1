import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OwnerRoute({
  children,
  roles = ["car_rental_owner", "hotel_owner", "restaurant_owner"],
}) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();

  if (!roles.includes(userRole)) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 8px 0",
            }}
          >
            تم رفض الوصول
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            يجب أن تكون مالكًا للوصول إلى هذه البوابة.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
