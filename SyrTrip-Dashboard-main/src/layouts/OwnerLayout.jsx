import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import "./OwnerLayout.css";
import {
  Bell,
  CalendarDays,
  CarFront,
  Hotel,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Star,
  UserRound,
  UtensilsCrossed,
  X,
} from "lucide-react";

export default function OwnerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    document.body.classList.add("owner-shell-active");
    return () => document.body.classList.remove("owner-shell-active");
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await API.get("/notifications/me");
      const notifList = Array.isArray(res.data)
        ? res.data
        : res.data?.notifications || [];
      setNotifications(notifList);
      const unread = notifList.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/read`);
      loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.url) {
      navigate(notification.url);
      setNotificationsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const ownerName = user?.name || "المالك";
  const ownerRole =
    {
      hotel_owner: "مالك فندق",
      restaurant_owner: "مالك مطعم",
      car_rental_owner: "مالك مكتب سيارات",
      car_owner: "مالك سيارات",
    }[
      (
        user?.role ||
        user?.user?.role ||
        (user?.roles && user.roles[0])
      )?.toLowerCase()
    ] || "المالك";
  const roleKey = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const isRestaurantOwner = roleKey === "restaurant_owner";
  const isCarOwner = roleKey === "car_rental_owner" || roleKey === "car_owner";
  const businessLabel = isRestaurantOwner
    ? "Restaurant"
    : isCarOwner
      ? "Car Rental"
      : "Hotel";

  const menuItems = [
    { path: "/owner/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { path: "/owner/bookings", label: "الحجوزات", icon: CalendarDays },
    {
      path: "/owner/listings",
      label: isRestaurantOwner ? "مطاعمي" : isCarOwner ? "سياراتي" : "فنادقـي",
      icon: isRestaurantOwner ? UtensilsCrossed : isCarOwner ? CarFront : Hotel,
    },
    {
      path: isRestaurantOwner
        ? "/owner/listings/new/restaurant"
        : isCarOwner
          ? "/owner/listings/new/car"
          : "/owner/listings/new",
      label: isRestaurantOwner
        ? "إضافة مطعم"
        : isCarOwner
          ? "إضافة سيارة"
          : "إضافة فندق",
      icon: Plus,
    },
    { path: "/owner/reviews", label: "التقييمات", icon: Star },
    { path: "/owner/profile", label: "الملف الشخصي", icon: UserRound },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    (path === "/owner/listings" &&
      location.pathname.startsWith("/owner/listings/edit"));

  return (
    <div className="owner-layout">
      {sidebarOpen && (
        <button
          className="owner-sidebar-backdrop"
          aria-label="إغلاق القائمة"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`owner-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="owner-sidebar-header">
          <h2 className="owner-logo">SyrTrip</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className="owner-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`owner-nav-link ${isActive(item.path) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">
                <item.icon size={18} strokeWidth={2} />
              </span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="owner-sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="owner-main">
        {/* Top Navigation */}
        <header className="owner-topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle-mobile"
              aria-label="فتح القائمة"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="topbar-kicker">
                {businessLabel === "Restaurant"
                  ? "إدارة المطعم"
                  : businessLabel === "Car Rental"
                    ? "إدارة تأجير السيارات"
                    : "إدارة الفندق"}
              </p>
              <h1 className="topbar-title">بوابة المالك</h1>
            </div>
          </div>

          <div className="topbar-right">
            <div className="owner-info">
              <div className="owner-avatar" aria-hidden="true">
                {ownerInitial}
              </div>
              <div className="owner-name-section">
                <div className="owner-name">{ownerName}</div>
                <div className="owner-role">{ownerRole}</div>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="notification-container">
              <button
                className="notification-bell"
                aria-label={`الإشعارات${unreadCount ? `، ${unreadCount} غير مقروءة` : ""}`}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>الإشعارات</h3>
                    <button
                      className="close-dropdown"
                      aria-label="إغلاق الإشعارات"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="notification-empty">لا توجد إشعارات</div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notification-item ${notif.isRead ? "read" : "unread"}`}
                          onClick={() => handleNotificationClick(notif)}
                          style={{ cursor: notif.url ? "pointer" : "default" }}
                        >
                          <div className="notification-content">
                            <h4 className="notification-title">
                              {notif.title}
                            </h4>
                            <p className="notification-message">
                              {notif.message}
                            </p>
                            <small className="notification-time">
                              {new Date(notif.createdAt).toLocaleString()}
                            </small>
                          </div>
                          {!notif.isRead && (
                            <button
                              className="mark-read-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleMarkAsRead(notif.id);
                              }}
                            >
                              تحديد كمقروء
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="logout-btn-mobile" onClick={handleLogout}>
              تسجيل الخروج
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="owner-content">{children}</main>
      </div>
    </div>
  );
}
