import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Hotels from "./pages/Hotels";
import Places from "./pages/Places";
import Restaurants from "./pages/Restaurants";
import AddHotel from "./pages/AddHotel";
import EditHotel from "./pages/EditHotel";
import AddPlace from "./pages/AddPlace";
import AddRestaurant from "./pages/AddRestaurant";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          marginLeft: 260,
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
        }}
        className="main-content"
      >
        <div style={{ padding: 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/places" element={<Places />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/add-hotel" element={<AddHotel />} />
            <Route path="/edit-hotel/:id" element={<EditHotel />} />
            <Route path="/add-place" element={<AddPlace />} />
            <Route path="/add-restaurant" element={<AddRestaurant />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}