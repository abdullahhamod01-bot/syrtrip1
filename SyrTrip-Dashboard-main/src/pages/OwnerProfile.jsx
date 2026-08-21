import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";

export default function OwnerListings() {
  const [listings, setListings] = useState({
    hotels: [],
    cars: [],
    restaurants: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hotels");
  const { user } = useAuth();
  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const [hotelsRes, carsRes, restaurantsRes] = await Promise.all([
        API.get("/hotels", { params: { page: 1, limit: 100 } }),
        API.get("/cars"),
        API.get("/restaurants"),
      ]);

      const allHotels = Array.isArray(hotelsRes.data)
        ? hotelsRes.data
        : hotelsRes.data?.hotels || [];
      setListings({
        hotels: userId
          ? allHotels.filter((hotel) => {
              const ownerId =
                hotel.ownerId ||
                hotel.owner?.id ||
                hotel.owner?._id ||
                hotel.owner;
              return String(ownerId) === String(userId);
            })
          : allHotels,
        cars: Array.isArray(carsRes.data)
          ? carsRes.data
          : carsRes.data?.cars || [],
        restaurants: Array.isArray(restaurantsRes.data)
          ? restaurantsRes.data
          : restaurantsRes.data?.restaurants || [],
      });
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه القائمة؟")) return;

    try {
      const endpoint =
        type === "hotels"
          ? `/hotels/${id}`
          : type === "cars"
            ? `/cars/${id}`
            : `/restaurants/${id}`;
      await API.delete(endpoint);
      loadListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  if (loading) {
    return (
      <OwnerLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <p style={{ color: "#6b7280" }}>جار تحميل القوائم...</p>
        </div>
      </OwnerLayout>
    );
  }

  const tabs = [
    { id: "hotels", label: "Hotels", count: listings.hotels.length },
    { id: "cars", label: "Cars", count: listings.cars.length },
    {
      id: "restaurants",
      label: "Restaurants",
      count: listings.restaurants.length,
    },
  ];

  const currentListings = listings[activeTab] || [];

  return (
    <OwnerLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 8px 0",
            }}
          >
            قوائمي
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            إدارة منشآتك وخدماتك
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border:
                  activeTab === tab.id
                    ? "2px solid #667eea"
                    : "1px solid #e5e7eb",
                background: activeTab === tab.id ? "#f0f4ff" : "#fff",
                color: activeTab === tab.id ? "#667eea" : "#6b7280",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {currentListings.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#f9fafb",
              borderRadius: 16,
              border: "1px dashed #e5e7eb",
            }}
          >
            <p style={{ color: "#9ca3af", fontSize: 14 }}>
              No {activeTab} listings yet
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {currentListings.map((item) => (
              <div
                key={item.id || item._id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {/* Image */}
                {item.images && item.images[0] && (
                  <div
                    style={{
                      height: 200,
                      background: `url(${item.images[0]}) center/cover`,
                      backgroundSize: "cover",
                    }}
                  />
                )}

                {/* Content */}
                <div style={{ padding: 20 }}>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {item.name || item.brand}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 13,
                      color: "#6b7280",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description || item.cuisine || item.model || "-"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      ${item.pricePerNight || item.pricePerDay || "N/A"}
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {item.pricePerNight
                          ? "/night"
                          : item.pricePerDay
                            ? "/day"
                            : ""}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleDelete(activeTab, item.id || item._id)
                      }
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #fee2e2",
                        background: "#fef2f2",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#fee2e2";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#fef2f2";
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
