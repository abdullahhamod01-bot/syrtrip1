import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OwnerDashboard from "./OwnerDashboard";
import RestaurantOwnerDashboard from "./RestaurantOwnerDashboard";
import CarOwnerDashboard from "./CarOwnerDashboard";

export default function OwnerDashboardRouter() {
  const { user } = useAuth();
  const role = (
    user?.role ||
    user?.user?.role ||
    user?.roles?.[0]
  )?.toLowerCase();

  if (role === "restaurant_owner") return <RestaurantOwnerDashboard />;
  if (role === "car_rental_owner" || role === "car_owner")
    return <CarOwnerDashboard />;
  return role === "hotel_owner" ? (
    <OwnerDashboard />
  ) : (
    <Navigate to="/login" replace />
  );
}
