import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Hotel,
  MapPin,
  UtensilsCrossed,
  Bus,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/hotels", icon: Hotel, label: "Hotels" },
    { path: "/places", icon: MapPin, label: "Places" },
    { path: "/restaurants", icon: UtensilsCrossed, label: "Restaurants" },
    { path: "/transport", icon: Bus, label: "Transport" },
  ];

  const addItems = [
    { path: "/add-hotel", icon: PlusCircle, label: "Add Hotel" },
    { path: "/add-place", icon: PlusCircle, label: "Add Place" },
    { path: "/add-restaurant", icon: PlusCircle, label: "Add Restaurant" },
    { path: "/add-transport", icon: PlusCircle, label: "Add Transport" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
      style={{
        width: collapsed ? 80 : 260,
        height: "100vh",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LayoutDashboard size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Tourism
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                marginTop: 2,
              }}
            >
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          right: -14,
          top: 32,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#667eea",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(102,126,234,0.4)",
          transition: "transform 0.3s",
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {/* Main Menu */}
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 12,
            paddingLeft: collapsed ? 0 : 12,
            textAlign: collapsed ? "center" : "left",
          }}
        >
          {!collapsed && "Main Menu"}
        </div>

        {menuItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderRadius: 10,
                marginBottom: 4,
                textDecoration: "none",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                background: active
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
                transition: "all 0.2s ease",
                fontSize: 14,
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              )}
            </Link>
          );
        })}

        {/* Add New Section */}
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "rgba(255,255,255,0.4)",
            marginTop: 24,
            marginBottom: 12,
            paddingLeft: collapsed ? 0 : 12,
            textAlign: collapsed ? "center" : "left",
          }}
        >
          {!collapsed && "Add New"}
        </div>

        {addItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderRadius: 10,
                marginBottom: 4,
                textDecoration: "none",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                background: active
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
                transition: "all 0.2s ease",
                fontSize: 14,
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.05)",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>A</span>
          </div>
          {!collapsed && (
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Admin
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                admin@tourism.com
              </p>
            </div>
          )}
          {!collapsed && <LogOut size={16} color="rgba(255,255,255,0.4)" />}
        </div>
      </div>
    </aside>
  );
}