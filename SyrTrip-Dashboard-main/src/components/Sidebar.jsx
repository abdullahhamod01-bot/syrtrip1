import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Hotel,
  MapPin,
  UtensilsCrossed,
  CalendarDays,
  Building2,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserRound,
  Bell,
  UserPlus,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const { user, logout } = useAuth();

  const role = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();

  const menuItems = [
    {
      path: "/",
      icon: LayoutDashboard,
      label: "لوحة التحكم",
      roles: ["admin"],
    },
    { path: "/hotels", icon: Hotel, label: "الفنادق", roles: ["admin"] },
    { path: "/landmarks", icon: MapPin, label: "المعالم", roles: ["admin"] },
    {
      path: "/restaurants",
      icon: UtensilsCrossed,
      label: "المطاعم",
      roles: ["admin"],
    },
    {
      path: "/events",
      icon: CalendarDays,
      label: "الفعاليات",
      roles: ["admin"],
    },
    {
      path: "/send-notifications",
      icon: Bell,
      label: "الإشعارات",
      roles: ["admin"],
    },
    {
      path: "/offices",
      icon: Building2,
      label: "مكاتب السيارات",
      roles: ["admin"],
    },
  ];

  const addItems = [
    {
      path: "/add-user",
      icon: UserPlus,
      label: "إضافة مستخدم",
      roles: ["admin"],
    },
    {
      path: "/add-hotel",
      icon: PlusCircle,
      label: "إضافة فندق",
      roles: ["admin"],
    },
    {
      path: "/add-landmark",
      icon: PlusCircle,
      label: "إضافة معلم",
      roles: ["admin"],
    },
    {
      path: "/add-restaurant",
      icon: PlusCircle,
      label: "إضافة مطعم",
      roles: ["admin"],
    },
    {
      path: "/add-event",
      icon: PlusCircle,
      label: "إضافة فعالية",
      roles: ["admin"],
    },
    {
      path: "/add-office",
      icon: PlusCircle,
      label: "إضافة مكتب سيارات",
      roles: ["admin"],
    },
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
        right: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: "-4px 0 20px rgba(0,0,0,0.3)",
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
              لوحة الإدارة
            </p>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          left: -14,
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
      <nav
        className="sidebar-nav"
        style={{
          flex: 1,
          padding: "16px 12px",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
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
          {!collapsed && "القائمة الرئيسية"}
        </div>

        {menuItems.map((item) => {
          if (item.roles && !item.roles.includes(role)) return null;
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
                    marginRight: "auto",
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
          {!collapsed && "إضافة جديدة"}
        </div>

        {addItems.map((item) => {
          if (item.roles && !item.roles.includes(role)) return null;
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
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                {user?.name || (role ? role.replace("_", " ") : "زائر")}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {user?.email || "not-signed-in"}
              </p>
              <Link
                to="/profile"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 6,
                  color: "#c7d2fe",
                  textDecoration: "none",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <UserRound size={12} />
                الملف الشخصي
              </Link>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout()}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
              }}
            >
              <LogOut size={16} color="rgba(255,255,255,0.4)" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
