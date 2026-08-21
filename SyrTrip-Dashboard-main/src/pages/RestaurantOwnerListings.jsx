import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, MapPin, Phone, RefreshCw, UtensilsCrossed } from "lucide-react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";

export default function RestaurantOwnerListings() {
  const { user } = useAuth();
  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRestaurants = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/restaurants", {
        params: { page: 1, limit: 100 },
      });
      const allRestaurants = Array.isArray(res.data)
        ? res.data
        : res.data?.restaurants || [];
      setRestaurants(
        userId
          ? allRestaurants.filter((restaurant) => {
              const ownerId =
                restaurant.ownerId ||
                restaurant.owner?.id ||
                restaurant.owner?._id ||
                restaurant.owner;
              return String(ownerId) === String(userId);
            })
          : allRestaurants,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your restaurants.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, [userId]);

  if (loading) {
    return (
      <OwnerLayout>
        <div className="owner-loading-state">جار تحميل مطاعمك...</div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="owner-page" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          className="owner-page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p className="owner-section-eyebrow">نشاطك التجاري</p>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 8px",
              }}
            >
              مطاعمي
            </h1>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
              حافظ على دقة قوائم الطعام واستعدادها للضيوف.
            </p>
          </div>
          <div
            className="owner-page-actions"
            style={{ display: "flex", gap: 10 }}
          >
            <Link
              to="/owner/listings/new/restaurant"
              className="owner-primary-button"
            >
              إضافة مطعم
            </Link>
            <button className="owner-ghost-button" onClick={loadRestaurants}>
              <RefreshCw size={15} /> تحديث
            </button>
          </div>
        </div>

        {error && <div className="owner-error-banner">{error}</div>}

        {restaurants.length === 0 ? (
          <div className="owner-empty-state owner-surface">
            <UtensilsCrossed size={42} color="#9db3c5" />
            <h3>لا توجد قوائم مطاعم بعد</h3>
            <p>أضف مطعمك الأول لبدء إدارة بياناته العامة.</p>
            <Link
              to="/owner/listings/new/restaurant"
              className="owner-primary-button"
            >
              إضافة مطعم
            </Link>
          </div>
        ) : (
          <div
            className="owner-listings-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: 20,
            }}
          >
            {restaurants.map((restaurant) => {
              const id = restaurant.id || restaurant._id;
              return (
                <article
                  className="owner-listing-card"
                  key={id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    className="owner-listing-image"
                    style={{
                      backgroundImage: restaurant.images?.[0]
                        ? `url(${restaurant.images[0]})`
                        : undefined,
                    }}
                  >
                    {!restaurant.images?.[0] && (
                      <UtensilsCrossed size={42} color="#6f9ab5" />
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 10px",
                          fontSize: 18,
                          color: "#111827",
                        }}
                      >
                        {restaurant.name || "Unnamed restaurant"}
                      </h3>
                      <span
                        className={`owner-availability ${restaurant.isAvailable === false ? "offline" : "online"}`}
                      >
                        {restaurant.isAvailable === false ? "Closed" : "Open"}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 16px",
                        color: "#6b7280",
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {restaurant.description || "No description provided."}
                    </p>
                    <div className="owner-listing-meta">
                      <span>
                        <MapPin size={14} />
                        {restaurant.location || "Location not provided"}
                      </span>
                      <span>
                        <Phone size={14} />
                        {restaurant.phone || "Phone not provided"}
                      </span>
                    </div>
                    <Link
                      className="owner-edit-link"
                      to={`/owner/listings/edit/restaurant/${id}`}
                    >
                      <Edit3 size={14} /> تعديل المطعم
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
