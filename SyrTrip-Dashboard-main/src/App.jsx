import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Hotels from "./pages/Hotels";
import Landmarks from "./pages/Landmarks";
import Restaurants from "./pages/Restaurants";
import Events from "./pages/Events";
import CarOffices from "./pages/CarOffices";
import AddHotel from "./pages/AddHotel";
import EditHotel from "./pages/EditHotel";
import AddLandmark from "./pages/AddLandmark";
import EditLandmark from "./pages/EditLandmark";
import AddRestaurant from "./pages/AddRestaurant";
import EditRestaurant from "./pages/EditRestaurant";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import SendNotifications from "./pages/SendNotifications";
import AddUser from "./pages/AddUser";
import AddCarOffice from "./pages/AddCarOffice";
import EditCarOffice from "./pages/EditCarOffice";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerRoute from "./components/OwnerRoute";
import OwnerLayout from "./layouts/OwnerLayout";
import OwnerBookings from "./pages/OwnerBookings";
import OwnerProfilePage from "./pages/OwnerProfilePage";
import RestaurantOwnerDashboard from "./pages/RestaurantOwnerDashboard";
import RestaurantOwnerListings from "./pages/RestaurantOwnerListings";
import OwnerReviews from "./pages/OwnerReviews";
import OwnerDashboardRouter from "./pages/OwnerDashboardRouter";
import OwnerListingsRouter from "./pages/OwnerListingsRouter";
import AddCar from "./pages/AddCar";
import EditCar from "./pages/EditCar";

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isOwnerRoute = location.pathname.startsWith("/owner");
  const showMainLayout = !isLoginPage && !isRegisterPage && !isOwnerRoute;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {showMainLayout && <Sidebar />}

      <main
        style={{
          flex: 1,
          marginRight: showMainLayout ? 260 : 0,
          minHeight: "100vh",
          transition: "margin-right 0.3s ease",
        }}
        className="main-content"
      >
        <div style={{ padding: 0 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hotels"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Hotels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landmarks"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Landmarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurants"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Restaurants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/send-notifications"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <SendNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-user"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offices"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <CarOffices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-office"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AddCarOffice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-office/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <EditCarOffice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-hotel"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AddHotel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-hotel/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <EditHotel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-landmark"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AddLandmark />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-landmark/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <EditLandmark />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-restaurant"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AddRestaurant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-restaurant/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <EditRestaurant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-event"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AddEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-event/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <EditEvent />
                </ProtectedRoute>
              }
            />

            {/* Owner Portal Routes */}
            <Route
              path="/owner/dashboard"
              element={
                <OwnerRoute
                  roles={[
                    "hotel_owner",
                    "restaurant_owner",
                    "car_rental_owner",
                    "car_owner",
                  ]}
                >
                  <OwnerDashboardRouter />
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/bookings"
              element={
                <OwnerRoute
                  roles={[
                    "hotel_owner",
                    "restaurant_owner",
                    "car_rental_owner",
                    "car_owner",
                  ]}
                >
                  <OwnerBookings />
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings"
              element={
                <OwnerRoute
                  roles={[
                    "hotel_owner",
                    "restaurant_owner",
                    "car_rental_owner",
                    "car_owner",
                  ]}
                >
                  <OwnerListingsRouter />
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings/new"
              element={
                <OwnerRoute roles={["hotel_owner"]}>
                  <OwnerLayout>
                    <AddHotel />
                  </OwnerLayout>
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings/new/restaurant"
              element={
                <OwnerRoute roles={["restaurant_owner"]}>
                  <OwnerLayout>
                    <AddRestaurant />
                  </OwnerLayout>
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings/new/car"
              element={
                <OwnerRoute roles={["car_rental_owner", "car_owner"]}>
                  <OwnerLayout>
                    <AddCar />
                  </OwnerLayout>
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings/edit/:id"
              element={
                <OwnerRoute roles={["hotel_owner"]}>
                  <OwnerLayout>
                    <EditHotel />
                  </OwnerLayout>
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings/edit/restaurant/:id"
              element={
                <OwnerRoute roles={["restaurant_owner"]}>
                  <OwnerLayout>
                    <EditRestaurant />
                  </OwnerLayout>
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings/edit/car/:id"
              element={
                <OwnerRoute roles={["car_rental_owner", "car_owner"]}>
                  <OwnerLayout>
                    <EditCar />
                  </OwnerLayout>
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/office/edit/:id"
              element={
                <OwnerRoute roles={["car_rental_owner", "car_owner"]}>
                  <OwnerLayout>
                    <EditCarOffice />
                  </OwnerLayout>
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/reviews"
              element={
                <OwnerRoute
                  roles={[
                    "hotel_owner",
                    "restaurant_owner",
                    "car_rental_owner",
                    "car_owner",
                  ]}
                >
                  <OwnerReviews />
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/profile"
              element={
                <OwnerRoute
                  roles={[
                    "hotel_owner",
                    "restaurant_owner",
                    "car_rental_owner",
                    "car_owner",
                  ]}
                >
                  <OwnerProfilePage />
                </OwnerRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
