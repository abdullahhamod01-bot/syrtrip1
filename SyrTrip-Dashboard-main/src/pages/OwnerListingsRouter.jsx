import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OwnerListings from "./OwnerListings";
import RestaurantOwnerListings from "./RestaurantOwnerListings";
import CarOwnerListings from "./CarOwnerListings";

export default function OwnerListingsRouter() {
  const { user } = useAuth();
  const role = (
    user?.role ||
    user?.user?.role ||
    user?.roles?.[0]
  )?.toLowerCase();

  if (role === "restaurant_owner") return <RestaurantOwnerListings />;
  if (role === "car_rental_owner" || role === "car_owner")
    return <CarOwnerListings />;
  return role === "hotel_owner" ? (
    <OwnerListings />
  ) : (
    <Navigate to="/login" replace />
  );
}
