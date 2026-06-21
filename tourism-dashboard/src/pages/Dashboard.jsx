import { useEffect, useState } from "react";
import API from "../api/api";
import {
  Hotel,
  MapPin,
  UtensilsCrossed,
  Bus,
  TrendingUp,
  Star,
  ArrowUpRight,
  Activity,
} from "lucide-react";

export default function Dashboard() {
  const [hotels, setHotels] = useState([]);
  const [places, setPlaces] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [transport, setTransport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelsRes, placesRes, restaurantsRes, transportRes] = await Promise.all([
          API.get("/hotels"),
          API.get("/places"),
          API.get("/restaurants"),
          API.get("/transport"),
        ]);
        setHotels(hotelsRes.data);
        setPlaces(placesRes.data);
        setRestaurants(restaurantsRes.data);
        setTransport(transportRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalItems = hotels.length + places.length + restaurants.length + transport.length;
  const avgRating = [...hotels, ...places, ...restaurants, ...transport].reduce(
    (acc, item) => acc + (item.rating || 0),
    0
  ) / (totalItems || 1);

  const statsCards = [
    {
      title: "Total Hotels",
      value: hotels.length,
      icon: Hotel,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Places",
      value: places.length,
      icon: MapPin,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Restaurants",
      value: restaurants.length,
      icon: UtensilsCrossed,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Transport",
      value: transport.length,
      icon: Bus,
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      trend: "+20%",
      trendUp: true,
    },
  ];

  const recentItems = [...hotels, ...places, ...restaurants, ...transport]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading dashboard...</p>
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
          Dashboard Overview
        </h1>
        <p
          style={{
            color: "#6b7280",
            fontSize: 15,
            margin: 0,
          }}
        >
          Welcome back! Here's what's happening with your tourism data.
        </p>
      </div>

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
                boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
                border: "1px solid #f3f4f6",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(0,0,0,0.1)";
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: card.trendUp
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                    color: card.trendUp ? "#16a34a" : "#dc2626",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {card.trendUp ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                  {card.trend}
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
                Distribution Overview
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Breakdown of your tourism data
              </p>
            </div>
            <Activity size={20} color="#9ca3af" />
          </div>

          {/* Custom Bar Chart */}
          <div style={{ padding: "20px 0" }}>
            {[
              {
                label: "Hotels",
                value: hotels.length,
                color: "#667eea",
                max: Math.max(hotels.length, places.length, restaurants.length, transport.length, 1),
              },
              {
                label: "Places",
                value: places.length,
                color: "#f5576c",
                max: Math.max(hotels.length, places.length, restaurants.length, transport.length, 1),
              },
              {
                label: "Restaurants",
                value: restaurants.length,
                color: "#4facfe",
                max: Math.max(hotels.length, places.length, restaurants.length, transport.length, 1),
              },
              {
                label: "Transport",
                value: transport.length,
                color: "#fa709a",
                max: Math.max(hotels.length, places.length, restaurants.length, transport.length, 1),
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
              { label: "Hotels", value: hotels.length, color: "#667eea" },
              { label: "Places", value: places.length, color: "#f5576c" },
              { label: "Restaurants", value: restaurants.length, color: "#4facfe" },
              { label: "Transport", value: transport.length, color: "#fa709a" },
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
                Recent Activity
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Latest additions
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
                No items yet
              </p>
            ) : (
              recentItems.map((item, i) => {
                const isHotel = hotels.find((h) => h._id === item._id);
                const isPlace = places.find((p) => p._id === item._id);
                const isRestaurant = restaurants.find((r) => r._id === item._id);
                const isTransport = transport.find((t) => t._id === item._id);
                
                const type = isHotel
                  ? "Hotel"
                  : isPlace
                  ? "Place"
                  : isRestaurant
                  ? "Restaurant"
                  : "Transport";
                  
                const iconColor = isHotel
                  ? "#667eea"
                  : isPlace
                  ? "#f5576c"
                  : isRestaurant
                  ? "#4facfe"
                  : "#fa709a";
                  
                const Icon = isHotel
                  ? Hotel
                  : isPlace
                  ? MapPin
                  : isRestaurant
                  ? UtensilsCrossed
                  : Bus;

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
            Total Tourism Items
          </h3>
          <p
            style={{
              fontSize: 14,
              opacity: 0.8,
              margin: 0,
            }}
          >
            Manage all your hotels, places, restaurants, and transport in one place
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