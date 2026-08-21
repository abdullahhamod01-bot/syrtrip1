import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  MapPin,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";

export default function RestaurantOwnerDashboard() {
  const { user } = useAuth();
  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [restaurantsRes, bookingsRes] = await Promise.all([
        API.get("/restaurants", { params: { page: 1, limit: 100 } }),
        API.get("/bookings/owner-bookings"),
      ]);
      const allRestaurants = Array.isArray(restaurantsRes.data)
        ? restaurantsRes.data
        : restaurantsRes.data?.restaurants || [];
      const ownedRestaurants = userId
        ? allRestaurants.filter((restaurant) => {
            const ownerId =
              restaurant.ownerId ||
              restaurant.owner?.id ||
              restaurant.owner?._id ||
              restaurant.owner;
            return String(ownerId) === String(userId);
          })
        : allRestaurants;
      const ownerBookings = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data?.bookings || [];
      setRestaurants(ownedRestaurants);
      setBookings(ownerBookings);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "تعذر تحميل لوحة تحكم المطعم.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  if (loading)
    return (
      <OwnerLayout>
        <div className="owner-loading-state">جار تحميل لوحة تحكم المطعم...</div>
      </OwnerLayout>
    );

  const pending = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;
  const approved = bookings.filter(
    (booking) => booking.status === "APPROVED",
  ).length;
  const restaurant = restaurants[0];

  return (
    <OwnerLayout>
      <div
        className="owner-page owner-dashboard-page"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
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
            <p className="owner-section-eyebrow">إدارة المطعم</p>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 8px",
              }}
            >
              صباح الخير
            </h1>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
              نظرة مركزة على حجوزات مطعمك وتجربة الضيوف.
            </p>
          </div>
          <button className="owner-ghost-button" onClick={loadDashboard}>
            <RefreshCw size={15} /> تحديث
          </button>
        </div>
        {error && <div className="owner-error-banner">{error}</div>}
        <div
          className="owner-stat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "الحجوزات",
              value: bookings.length,
              icon: CalendarDays,
              color: "#2e5f87",
            },
            { label: "معلقة", value: pending, icon: Clock3, color: "#b7791f" },
            {
              label: "مقبولة",
              value: approved,
              icon: CheckCircle2,
              color: "#237a58",
            },
            {
              label: "المطاعم",
              value: restaurants.length,
              icon: UtensilsCrossed,
              color: "#42658a",
            },
          ].map((stat) => (
            <div
              className="owner-stat-card"
              key={stat.label}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #f3f4f6",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div className="owner-stat-icon" style={{ color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <strong
                style={{
                  display: "block",
                  marginTop: 15,
                  fontSize: 28,
                  color: stat.color,
                }}
              >
                {stat.value}
              </strong>
              <span style={{ color: "#6b7280", fontSize: 13 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        <div
          className="owner-dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, .8fr)",
            gap: 24,
          }}
        >
          <section
            className="owner-surface"
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              border: "1px solid #f3f4f6",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div className="owner-section-heading">
              <div>
                <p className="owner-section-eyebrow">مطعمك</p>
                <h2>{restaurant?.name || "لم تتم إضافة مطعم"}</h2>
              </div>
              {restaurant && (
                <Link
                  className="owner-edit-link"
                  to={`/owner/listings/edit/restaurant/${restaurant.id || restaurant._id}`}
                >
                  <Edit3 size={14} /> تعديل البيانات
                </Link>
              )}
            </div>
            {restaurant ? (
              <>
                <div className="owner-restaurant-summary">
                  <div
                    className="owner-listing-image compact"
                    style={{
                      backgroundImage: restaurant.images?.[0]
                        ? `url(${restaurant.images[0]})`
                        : undefined,
                    }}
                  >
                    {!restaurant.images?.[0] && (
                      <UtensilsCrossed size={30} color="#6f9ab5" />
                    )}
                  </div>
                  <div>
                    <p className="owner-location">
                      <MapPin size={14} />
                      {restaurant.location || "لم يتم تحديد الموقع"}
                    </p>
                    <span
                      className={`owner-availability ${restaurant.isAvailable === false ? "offline" : "online"}`}
                    >
                      {restaurant.isAvailable === false
                        ? "لا يستقبل حجوزات"
                        : "يستقبل الحجوزات"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <Link
                className="owner-primary-button"
                to="/owner/listings/new/restaurant"
              >
                إضافة مطعم
              </Link>
            )}
          </section>
          <section
            className="owner-focus-panel"
            style={{
              background: "linear-gradient(145deg, #142235, #275777)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <UtensilsCrossed size={22} color="#f4b860" />
            <h2>تجربة الضيوف</h2>
            <p>
              حافظ على تحديث هوية مطعمك وموقعه وتوافره وصوره ليتمكن الضيوف من
              الاختيار بثقة.
            </p>
            <Link to="/owner/reviews">مراجعة آراء الضيوف</Link>
          </section>
        </div>
      </div>
    </OwnerLayout>
  );
}
