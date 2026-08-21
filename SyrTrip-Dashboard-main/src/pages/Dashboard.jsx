import { useEffect, useState } from "react";
import API from "../api/api";
import {
  Hotel,
  MapPin,
  UtensilsCrossed,
  Building2,
  CarFront,
  CalendarDays,
  Clock3,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const [hotels, setHotels] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [offices, setOffices] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const [
          hotelsRes,
          landmarksRes,
          restaurantsRes,
          officesRes,
          carsRes,
          bookingsRes,
        ] = await Promise.all([
          API.get("/hotels"),
          API.get("/landmarks"),
          API.get("/restaurants"),
          API.get("/offices"),
          API.get("/cars", { params: { search: "" } }),
          API.get("/bookings/owner-bookings"),
        ]);
        setHotels(
          Array.isArray(hotelsRes.data)
            ? hotelsRes.data
            : hotelsRes.data?.hotels || [],
        );
        setLandmarks(landmarksRes.data?.landmarks || []);
        setRestaurants(
          Array.isArray(restaurantsRes.data)
            ? restaurantsRes.data
            : restaurantsRes.data?.restaurants || [],
        );
        setOffices(officesRes.data?.offices || []);
        setCars(
          Array.isArray(carsRes.data) ? carsRes.data : carsRes.data?.cars || [],
        );
        setBookings(
          Array.isArray(bookingsRes.data)
            ? bookingsRes.data
            : bookingsRes.data?.bookings || [],
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message || "تعذر تحميل بعض إحصاءات لوحة التحكم.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalItems =
    hotels.length +
    landmarks.length +
    restaurants.length +
    offices.length +
    cars.length;
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;
  const approvedBookings = bookings.filter(
    (booking) => booking.status === "APPROVED",
  ).length;
  const bookedValue = bookings.reduce(
    (total, booking) => total + Number(booking.totalPrice || 0),
    0,
  );

  const statsCards = [
    {
      title: "إجمالي الفنادق",
      value: hotels.length,
      icon: Hotel,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "إجمالي المعالم",
      value: landmarks.length,
      icon: MapPin,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "المطاعم",
      value: restaurants.length,
      icon: UtensilsCrossed,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "السيارات المتاحة",
      value: cars.length,
      icon: CarFront,
      color: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
    },
    {
      title: "إجمالي الحجوزات",
      value: bookings.length,
      icon: CalendarDays,
      color: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
    },
    {
      title: "الحجوزات المعلقة",
      value: pendingBookings,
      icon: Clock3,
      color: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    },
  ];

  const recentItems = [...hotels, ...landmarks, ...restaurants, ...offices]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "3px solid #e5e7eb",
            borderTopColor: "#667eea",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          جار تحميل لوحة التحكم...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 8px 0",
            letterSpacing: -0.5,
          }}
        >
          نظرة عامة على لوحة التحكم
        </h1>
        <p
          style={{
            color: "#6b7280",
            fontSize: 15,
            margin: 0,
          }}
        >
          مرحبًا بعودتك. إليك آخر المستجدات في بياناتك السياحية.
        </p>
      </div>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            marginBottom: 24,
            border: "1px solid #fed7aa",
            borderRadius: 12,
            background: "#fff7ed",
            color: "#9a3412",
            fontSize: 14,
          }}
        >
          <Activity size={17} />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
                border: "1px solid #f3f4f6",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)";
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
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: card.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color="#fff" />
                </div>
                <div style={{ color: "#9ca3af" }}>
                  <Activity size={17} />
                </div>
              </div>
              <h3
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 4px 0",
                }}
              >
                {card.value}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                {card.title}
              </p>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          {
            label: "الحجوزات المقبولة",
            value: approvedBookings,
            icon: CheckCircle2,
            color: "#15803d",
            background: "#f0fdf4",
          },
          {
            label: "بانتظار المراجعة",
            value: pendingBookings,
            icon: Clock3,
            color: "#b45309",
            background: "#fffbeb",
          },
          {
            label: "قيمة الحجوزات",
            value: `$${bookedValue.toLocaleString()}`,
            icon: DollarSign,
            color: "#1d4ed8",
            background: "#eff6ff",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 18px",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  color: item.color,
                  background: item.background,
                }}
              >
                <Icon size={19} />
              </div>
              <div>
                <strong
                  style={{ display: "block", color: "#111827", fontSize: 20 }}
                >
                  {item.value}
                </strong>
                <span style={{ color: "#6b7280", fontSize: 12 }}>
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Activity Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginBottom: 32,
        }}
      >
        {/* Distribution Chart */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111827",
                  margin: "0 0 4px 0",
                }}
              >
                نظرة عامة على التوزيع
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                توزيع بياناتك السياحية
              </p>
            </div>
            <Activity size={20} color="#9ca3af" />
          </div>

          {/* Custom Bar Chart */}
          <div style={{ padding: "20px 0" }}>
            {[
              {
                label: "الفنادق",
                value: hotels.length,
                color: "#667eea",
                max: Math.max(
                  hotels.length,
                  landmarks.length,
                  restaurants.length,
                  offices.length,
                  cars.length,
                  1,
                ),
              },
              {
                label: "المعالم",
                value: landmarks.length,
                color: "#f5576c",
                max: Math.max(
                  hotels.length,
                  landmarks.length,
                  restaurants.length,
                  offices.length,
                  cars.length,
                  1,
                ),
              },
              {
                label: "المطاعم",
                value: restaurants.length,
                color: "#4facfe",
                max: Math.max(
                  hotels.length,
                  landmarks.length,
                  restaurants.length,
                  offices.length,
                  cars.length,
                  1,
                ),
              },
              {
                label: "مكاتب السيارات",
                value: offices.length,
                color: "#fa709a",
                max: Math.max(
                  hotels.length,
                  landmarks.length,
                  restaurants.length,
                  offices.length,
                  cars.length,
                  1,
                ),
              },
              {
                label: "السيارات",
                value: cars.length,
                color: "#14b8a6",
                max: Math.max(
                  hotels.length,
                  landmarks.length,
                  restaurants.length,
                  offices.length,
                  cars.length,
                  1,
                ),
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#f3f4f6",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(item.value / item.max) * 100}%`,
                      background: item.color,
                      borderRadius: 4,
                      transition: "width 1s ease-out",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mini Pie Chart Representation */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 32,
              marginTop: 24,
              paddingTop: 24,
              borderTop: "1px solid #f3f4f6",
            }}
          >
            {[
              { label: "الفنادق", value: hotels.length, color: "#667eea" },
              { label: "المعالم", value: landmarks.length, color: "#f5576c" },
              {
                label: "المطاعم",
                value: restaurants.length,
                color: "#4facfe",
              },
              { label: "مكاتب السيارات", value: offices.length, color: "#fa709a" },
              { label: "السيارات", value: cars.length, color: "#14b8a6" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: `conic-gradient(${item.color} 0% ${
                      totalItems > 0 ? (item.value / totalItems) * 100 : 0
                    }%, #f3f4f6 ${
                      totalItems > 0 ? (item.value / totalItems) * 100 : 0
                    }% 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: item.color,
                      }}
                    >
                      {totalItems > 0
                        ? Math.round((item.value / totalItems) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111827",
                  margin: "0 0 4px 0",
                }}
              >
                النشاط الأخير
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                أحدث الإضافات
              </p>
            </div>
            <TrendingUp size={20} color="#9ca3af" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {recentItems.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 14,
                  padding: "20px 0",
                }}
              >
                لا توجد عناصر بعد
              </p>
            ) : (
              recentItems.map((item, i) => {
                const isHotel = hotels.find((h) => h.id === item.id);
                const isLandmark = landmarks.find((p) => p.id === item.id);
                const isRestaurant = restaurants.find(
                  (r) => r.id === item.id,
                );

                const type = isHotel
                  ? "فندق"
                  : isLandmark
                    ? "معلم"
                    : isRestaurant
                      ? "مطعم"
                      : "مكتب سيارات";

                const iconColor = isHotel
                  ? "#667eea"
                  : isLandmark
                    ? "#f5576c"
                    : isRestaurant
                      ? "#4facfe"
                      : "#fa709a";

                const Icon = isHotel
                  ? Hotel
                  : isLandmark
                    ? MapPin
                    : isRestaurant
                      ? UtensilsCrossed
                      : Building2;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px",
                      borderRadius: 12,
                      background: "#f9fafb",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${iconColor}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={iconColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#111827",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0 0",
                          fontSize: 12,
                          color: "#9ca3af",
                        }}
                      >
                        {type} • {item.location || "No location"}
                      </p>
                    </div>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: iconColor,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 16,
          padding: "32px",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              margin: "0 0 8px 0",
            }}
          >
            إجمالي العناصر السياحية
          </h3>
          <p
            style={{
              fontSize: 14,
              opacity: 0.8,
              margin: 0,
            }}
          >
            أدر فنادقك ومعالمك ومطاعمك ومكاتب السيارات من مكان واحد
          </p>
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            opacity: 0.9,
          }}
        >
          {totalItems}
        </div>
      </div>
    </div>
  );
}
