import { useState, useEffect } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Send,
  Search,
  Filter,
  Users,
  MessageSquare,
  Link as LinkIcon,
  CheckSquare,
  Square,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const roleMapping = {
  ADMIN: "مدير",
  CUSTOMER: "عميل",
  CAR_RENTAL_OWNER: "مالك مكتب سيارات",
  HOTEL_OWNER: "مالك فندق",
  RESTAURANT_OWNER: "مالك مطعم",
};

const roleOptions = [
  { value: "", label: "كل الصلاحيات" },
  { value: "ADMIN", label: "مدير" },
  { value: "CUSTOMER", label: "عميل" },
  { value: "CAR_RENTAL_OWNER", label: "مالك مكتب سيارات" },
  { value: "HOTEL_OWNER", label: "مالك فندق" },
  { value: "RESTAURANT_OWNER", label: "مالك مطعم" },
];

function formatRole(roleValue) {
  return roleMapping[roleValue] || roleValue;
}

export default function SendNotifications() {
  const { user } = useAuth();
  const role = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    url: "",
  });
  const [formErrors, setFormErrors] = useState({});

  if (role !== "admin") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        غير مصرح، يمكن للمديرين فقط إرسال الإشعارات.
      </div>
    );
  }

  const loadUsers = async () => {
    setLoading(true);
    try {
      let url = "/users/admin/users?";
      const params = [];
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (searchQuery) params.push(`name=${searchQuery}`);
      url += params.join("&");

      const res = await API.get(url);
      const usersList = res.data?.users || [];
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Error loading users:", error);
      setErrorMessage(
        error.response?.data?.message || "تعذر تحميل المستخدمين.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query)),
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const validateNotification = () => {
    const nextErrors = {};
    if (!notificationForm.title.trim()) nextErrors.title = "العنوان مطلوب";
    if (!notificationForm.message.trim()) nextErrors.message = "الرسالة مطلوبة";
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const sendNotifications = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (selectedUsers.size === 0) {
      setErrorMessage("يرجى اختيار مستخدم واحد على الأقل.");
      return;
    }

    if (!validateNotification()) return;

    setSending(true);
    try {
      const selectedUserIds = Array.from(selectedUsers);
      const results = await Promise.allSettled(
        selectedUserIds.map((userId) =>
          API.post("/notifications/admin/send", {
            userId,
            title: notificationForm.title.trim(),
            message: notificationForm.message.trim(),
            url: notificationForm.url.trim() || undefined,
          }),
        ),
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        setSuccessMessage(`تم إرسال الإشعارات بنجاح إلى ${successful} مستخدم.`);
        setSelectedUsers(new Set());
        setNotificationForm({ title: "", message: "", url: "" });
      } else {
        setSuccessMessage(
          `تم الإرسال إلى ${successful} مستخدم، وفشل الإرسال إلى ${failed}.`,
        );
      }
    } catch (err) {
      console.error("Error sending notifications:", err);
      setErrorMessage(err.response?.data?.message || "فشل إرسال الإشعارات.");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: 12,
    border: `1.5px solid ${formErrors[fieldName] ? "#fca5a5" : "#e5e7eb"}`,
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    color: "#111827",
  });

  return (
    <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "#6b7280",
          textDecoration: "none",
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={16} />
        العودة إلى لوحة التحكم
      </Link>

      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 8px 0",
            letterSpacing: -0.6,
          }}
        >
          إرسال الإشعارات
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
          أنشئ إشعارات وأرسلها إلى عدة مستخدمين مع خيارات البحث والتصفية.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderRadius: 16,
            background: "#ecfdf5",
            border: "1px solid #bbf7d0",
            color: "#166534",
            marginBottom: 20,
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {successMessage}
          </span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderRadius: 16,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            marginBottom: 20,
          }}
        >
          <AlertTriangle size={18} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{errorMessage}</span>
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}
      >
        {/* Users Section */}
        <section
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 24,
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4f46e5",
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                اختيار المستلمين
              </h2>
              <p
                style={{ margin: "4px 0 0 0", fontSize: 13, color: "#6b7280" }}
              >
                اختر المستخدمين الذين سترسل إليهم الإشعارات
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(150px, 180px)",
              gap: 12,
              marginBottom: 20,
              alignItems: "stretch",
            }}
          >
            <div style={{ position: "relative", minWidth: 0 }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              <Filter size={14} color="#6b7280" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: "100%",
                  border: "none",
                  background: "none",
                  fontSize: 13,
                  color: "#374151",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
              }}
            >
              <Loader2
                size={28}
                color="#667eea"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                background: "#f9fafb",
                borderRadius: 14,
                border: "1px dashed #e5e7eb",
              }}
            >
              <Users size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                لم يتم العثور على مستخدمين مطابقين لمعاييرك
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              {/* Select All */}
              <div
                onClick={toggleSelectAll}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px",
                  borderRadius: 10,
                  background: "#f9fafb",
                  cursor: "pointer",
                  marginBottom: 8,
                  border: "1px solid #e5e7eb",
                }}
              >
                {selectedUsers.size === filteredUsers.length ? (
                  <CheckSquare size={20} color="#667eea" />
                ) : (
                  <Square size={20} color="#d1d5db" />
                )}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    flex: 1,
                  }}
                >
                  اختيار الكل ({filteredUsers.length})
                </span>
              </div>

              {/* Users Grid */}
              <div style={{ display: "grid", gap: 8 }}>
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => toggleUserSelection(u.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px",
                      borderRadius: 10,
                      background: selectedUsers.has(u.id) ? "#eef2ff" : "#fff",
                      cursor: "pointer",
                      border: `1px solid ${selectedUsers.has(u.id) ? "#c7d2fe" : "#e5e7eb"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    {selectedUsers.has(u.id) ? (
                      <CheckSquare size={20} color="#667eea" />
                    ) : (
                      <Square size={20} color="#d1d5db" />
                    )}
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        {u.name}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0 0",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {u.email}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: "#f3f4f6",
                        color: "#374151",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {formatRole(u.role || "CUSTOMER")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Notification Form Section */}
        <aside
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 24,
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #f3f4f6",
            height: "fit-content",
            position: "sticky",
            top: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d97706",
              }}
            >
              <Zap size={18} />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              إنشاء إشعار
            </h3>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                العنوان
              </label>
              <div style={{ position: "relative" }}>
                <MessageSquare
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="text"
                  placeholder="مرحبا بكم في SyrTrip"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  style={inputStyle("title")}
                />
              </div>
              {formErrors.title && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: 11,
                    margin: "4px 0 0 0",
                  }}
                >
                  {formErrors.title}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                الرسالة
              </label>
              <textarea
                placeholder="اكتب رسالتك هنا..."
                value={notificationForm.message}
                onChange={(e) =>
                  setNotificationForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${formErrors.message ? "#fca5a5" : "#e5e7eb"}`,
                  fontSize: 13,
                  outline: "none",
                  background: "#fff",
                  boxSizing: "border-box",
                  color: "#111827",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: 100,
                }}
              />
              {formErrors.message && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: 11,
                    margin: "4px 0 0 0",
                  }}
                >
                  {formErrors.message}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                URL (اختياري)
              </label>
              <div style={{ position: "relative" }}>
                <LinkIcon
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="text"
                  placeholder="/promotions"
                  value={notificationForm.url}
                  onChange={(e) =>
                    setNotificationForm((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  style={inputStyle("url")}
                />
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                color: "#0369a1",
                fontSize: 12,
              }}
            >
              <strong>{selectedUsers.size}</strong> مستخدم محدد، سيتم إرسال الإشعار إليهم.
            </div>

            <button
              onClick={sendNotifications}
              disabled={sending || selectedUsers.size === 0}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background:
                  sending || selectedUsers.size === 0
                    ? "#d1d5db"
                    : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  sending || selectedUsers.size === 0
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {sending ? (
                <>
                  <Loader2
                    size={16}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  جار الإرسال...
                </>
              ) : (
                <>
                  <Send size={16} />
                  إرسال الإشعارات
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
