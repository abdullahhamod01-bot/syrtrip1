import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";
import {
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hotel,
  MapPin,
  Pencil,
  RefreshCw,
  XCircle,
} from "lucide-react";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalListings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingsRes, hotelsRes] = await Promise.all([
        API.get("/bookings/owner-bookings"),
        API.get("/hotels", { params: { page: 1, limit: 100 } }),
      ]);

      const bookings = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data?.bookings || [];
      const allHotels = Array.isArray(hotelsRes.data)
        ? hotelsRes.data
        : hotelsRes.data?.hotels || [];
      const hotels = userId
        ? allHotels.filter((hotel) => {
            const ownerId =
              hotel.ownerId ||
              hotel.owner?.id ||
              hotel.owner?._id ||
              hotel.owner;
            return String(ownerId) === String(userId);
          })
        : allHotels;
      setHotels(hotels);
      setRecentBookings(bookings.slice(0, 4));

      const pendingCount = bookings.filter(
        (b) => b.status === "PENDING",
      ).length;
      const approvedCount = bookings.filter(
        (b) => b.status === "APPROVED",
      ).length;

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pendingCount,
        approvedBookings: approvedCount,
        totalListings: hotels.length,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.response?.data?.message || "تعذر تحميل لوحة تحكم الفندق.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

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
          <p style={{ color: "#6b7280" }}>جار تحميل لوحة التحكم...</p>
        </div>
      </OwnerLayout>
    );
  }

  const statCards = [
    {
      label: "إجمالي الحجوزات",
      value: stats.totalBookings,
      color: "#2e5f87",
      icon: CalendarDays,
    },
    {
      label: "الطلبات المعلقة",
      value: stats.pendingBookings,
      color: "#b7791f",
      icon: Clock3,
    },
    {
      label: "الحجوزات المقبولة",
      value: stats.approvedBookings,
      color: "#237a58",
      icon: CheckCircle2,
    },
    {
      label: "القوائم النشطة",
      value: stats.totalListings,
      color: "#42658a",
      icon: Building2,
    },
  ];

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
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 8px 0",
              }}
            >
              صباح الخير
            </h1>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
              إليك آخر المستجدات في فندقك اليوم.
            </p>
          </div>
          <button
            className="owner-ghost-button"
            onClick={loadDashboardData}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <RefreshCw size={15} /> تحديث
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <div
          className="owner-stat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {statCards.map((card, idx) => (
            <div
              className="owner-stat-card"
              key={idx}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #f3f4f6",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div className="owner-stat-icon" style={{ color: card.color }}>
                  <card.icon size={20} />
                </div>
                <div
                  style={{ fontSize: 28, fontWeight: 700, color: card.color }}
                >
                  {card.value}
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                {card.label}
              </p>
            </div>
          ))}
        </div>

        <div
          className="owner-dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(300px, 0.75fr)",
            gap: 24,
            marginBottom: 24,
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <p
                  style={{
                    color: "#667eea",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    margin: "0 0 6px",
                  }}
                >
                  منشأتك
                </p>
                <h2 style={{ fontSize: 21, color: "#111827", margin: 0 }}>
                  بيانات الفندق الحالية
                </h2>
              </div>
              {hotels[0] && (
                <Link
                  to={`/owner/listings/edit/${hotels[0].id || hotels[0]._id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 12px",
                    borderRadius: 9,
                    background: "#eef2ff",
                    color: "#4f46e5",
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <Pencil size={14} /> تحديث البيانات
                </Link>
              )}
            </div>
            {hotels[0] ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 18,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 100,
                    borderRadius: 12,
                    background: hotels[0].images?.[0]
                      ? `url(${hotels[0].images[0]}) center/cover`
                      : "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!hotels[0].images?.[0] && (
                    <Hotel size={32} color="#818cf8" />
                  )}
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: "#111827",
                      fontSize: 18,
                    }}
                  >
                    {hotels[0].name || "فندق بلا اسم"}
                  </h3>
                  <p
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      color: "#6b7280",
                      fontSize: 13,
                      margin: "0 0 7px",
                    }}
                  >
                    <MapPin size={14} color="#667eea" />
                    {hotels[0].location || "لم يتم تحديد الموقع"}
                  </p>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 9px",
                      borderRadius: 20,
                      background:
                        hotels[0].isAvailable === false ? "#fef2f2" : "#ecfdf5",
                      color:
                        hotels[0].isAvailable === false ? "#b91c1c" : "#166534",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {hotels[0].isAvailable === false ? (
                      <XCircle size={13} />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    {hotels[0].isAvailable === false
                      ? "لا يستقبل حجوزات"
                      : "يستقبل الحجوزات"}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
                لا تتوفر بيانات الفندق بعد.
              </p>
            )}
          </section>

          <section
            className="owner-focus-panel"
            style={{
              background: "linear-gradient(145deg, #142235, #275777)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 20px rgba(15,23,42,0.16)",
            }}
          >
            <Bell size={22} color="#c7d2fe" />
            <h2 style={{ fontSize: 20, margin: "16px 0 8px" }}>
              ابقَ على اطلاع
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.68)",
                fontSize: 13,
                lineHeight: 1.55,
                margin: "0 0 18px",
              }}
            >
              ستظهر طلبات الحجز الجديدة وتحديثات الحساب في مركز الإشعارات.
            </p>
            <Link
              to="/owner/bookings"
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              مراجعة طلبات الحجز ←
            </Link>
          </section>
        </div>

        <section
          className="owner-surface"
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ fontSize: 19, color: "#111827", margin: "0 0 5px" }}>
                طلبات الحجز الأخيرة
              </h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                استجب بسرعة للحفاظ على دقة التوافر.
              </p>
            </div>
            <Link
              to="/owner/bookings"
              style={{
                color: "#667eea",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              عرض الكل
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
              لا توجد طلبات حجز بعد.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "#f8fafc",
                  }}
                >
                  <div>
                    <strong style={{ color: "#111827", fontSize: 14 }}>
                      {booking.customer?.name || "العميل"}
                    </strong>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: 12,
                        margin: "4px 0 0",
                      }}
                    >
                      {booking.startDate
                        ? new Date(booking.startDate).toLocaleDateString(
                            "ar-SY",
                          )
                        : "لم يُحدد التاريخ"}{" "}
                      · ${booking.totalPrice ?? "-"}
                    </p>
                  </div>
                  <span
                    style={{
                      color:
                        booking.status === "PENDING"
                          ? "#92400e"
                          : booking.status === "APPROVED"
                            ? "#166534"
                            : "#991b1b",
                      background:
                        booking.status === "PENDING"
                          ? "#fef3c7"
                          : booking.status === "APPROVED"
                            ? "#dcfce7"
                            : "#fee2e2",
                      borderRadius: 20,
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div
          className="owner-surface"
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 16px 0",
            }}
          >
            مرحبًا بك في بوابة المالك
          </h2>
          <p
            style={{
              color: "#6b7280",
              fontSize: 14,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            أدر حجوزاتك ومنشآتك وابقَ على تواصل مع عملائك. استخدم القائمة للوصول
            إلى الحجوزات والقوائم وإعدادات الملف الشخصي.
          </p>
        </div>
      </div>
    </OwnerLayout>
  );
}
