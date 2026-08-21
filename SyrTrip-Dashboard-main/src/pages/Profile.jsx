import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  UserCircle2,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Save,
  LockKeyhole,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  UserRoundPen,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const initialProfileForm = {
  name: "",
  phone: "",
};

const initialPasswordForm = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/me");
      const currentUser = res.data?.user || res.data;
      setProfile(currentUser);
      setProfileForm({
        name: currentUser?.name || "",
        phone: currentUser?.phone || "",
      });
      if (refreshUser) {
        await refreshUser(currentUser);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setErrorMessage(
        error.response?.data?.message || "تعذر تحميل بيانات الملف الشخصي.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const role = (
    profile?.role ||
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  );
  const memberSince = profile?.createdAt || user?.createdAt;

  const validateProfile = () => {
    const nextErrors = {};
    if (!profileForm.name.trim()) nextErrors.name = "الاسم مطلوب";
    if (!profileForm.phone.trim()) nextErrors.phone = "رقم الهاتف مطلوب";
    setProfileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePassword = () => {
    const nextErrors = {};
    if (!passwordForm.oldPassword.trim())
      nextErrors.oldPassword = "كلمة المرور الحالية مطلوبة";
    if (!passwordForm.newPassword.trim())
      nextErrors.newPassword = "كلمة المرور الجديدة مطلوبة";
    if (passwordForm.newPassword.trim() && passwordForm.newPassword.length < 6)
      nextErrors.newPassword = "يجب ألا تقل كلمة المرور عن 6 أحرف";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      nextErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    setPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateProfile = async () => {
    setSuccessMessage("");
    setErrorMessage("");
    if (!validateProfile()) return;

    setSavingProfile(true);
    try {
      const res = await API.put("/users/me", {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
      const updated = res.data?.user ||
        res.data || { ...profile, ...profileForm };
      setProfile(updated);
      setSuccessMessage("تم تحديث الملف الشخصي بنجاح.");
      if (refreshUser) {
        await refreshUser(updated);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage(
        error.response?.data?.message || "فشل تحديث الملف الشخصي.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async () => {
    setSuccessMessage("");
    setErrorMessage("");
    if (!validatePassword()) return;

    setSavingPassword(true);
    try {
      await API.put("/users/me/password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(initialPasswordForm);
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setSuccessMessage("تم تحديث كلمة المرور بنجاح.");
    } catch (error) {
      console.error("Error updating password:", error);
      setErrorMessage(
        error.response?.data?.message || "فشل تحديث كلمة المرور.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const fieldStyle = (fieldName, errors) => ({
    width: "100%",
    padding: "14px 16px 14px 46px",
    borderRadius: 14,
    border: `1.5px solid ${errors[fieldName] ? "#fca5a5" : "#e5e7eb"}`,
    background: "#fff",
    fontSize: 14,
    outline: "none",
    color: "#111827",
    boxSizing: "border-box",
  });

  const tabButton = (isActive) => ({
    flex: 1,
    padding: "12px 16px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: isActive ? "#fff" : "#374151",
    background: isActive
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "#f3f4f6",
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Loader2
          size={34}
          color="#667eea"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          جار تحميل الملف الشخصي...
        </p>
      </div>
    );
  }

  const avatarLetter = (
    profile?.name ||
    user?.name ||
    profile?.email ||
    user?.email ||
    "A"
  )
    .charAt(0)
    .toUpperCase();

  function mapRole(role) {
    switch(role) {
      case "ADMIN": return "مدير النظام"
      case "CAR_RENTAL_OWNER": return "مدير مكتب السيارات"
      case "RESTAURANT_OWNER": return "مدير المطعم"
      case "HOTEL_OWNER": return "مدير الفندق"
      default: return "زبون"
    }
  }

  return (
    <div style={{ padding: "32px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#6b7280",
            textDecoration: "none",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={16} />
          العودة إلى لوحة التحكم
        </Link>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 8px 0",
                letterSpacing: -0.6,
              }}
            >
              الملف الشخصي
            </h1>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
              إدارة بيانات حسابك وتحديث كلمة المرور بأمان.
            </p>
          </div>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "#eef2ff",
              color: "#4f46e5",
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShieldCheck size={16} />
            {mapRole(role)}
          </div>
        </div>
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
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <aside
          style={{
            background: "linear-gradient(180deg, #111827 0%, #1f2937 100%)",
            color: "#fff",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 24,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
              marginBottom: 18,
            }}
          >
            {avatarLetter}
          </div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: 24, fontWeight: 800 }}>
            {profile?.name || user?.name || "Your account"}
          </h2>
          <p
            style={{
              margin: "0 0 18px 0",
              color: "rgba(255,255,255,0.72)",
              fontSize: 14,
            }}
          >
            {profile?.email || user?.email || "No email available"}
          </p>

          <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Mail size={18} color="#c7d2fe" />
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  البريد الإلكتروني
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {profile?.email || user?.email || "-"}
                </div>
              </div>
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Phone size={18} color="#c7d2fe" />
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  الهاتف
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {profile?.phone || user?.phone || "-"}
                </div>
              </div>
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <CalendarDays size={18} color="#c7d2fe" />
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  عضو منذ
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {memberSince
                    ? new Date(memberSince).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 18,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 6,
              }}
            >
              الصلاحية الحالية
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {mapRole(role)}
            </div>
          </div>
        </aside>

        <section style={{ display: "grid", gap: 24 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 24,
              border: "1px solid #eef2f7",
              boxShadow:
                "0 1px 3px rgba(15,23,42,0.06), 0 16px 32px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: 6,
                background: "#f8fafc",
                borderRadius: 18,
                marginBottom: 24,
              }}
            >
              <button
                onClick={() => setActiveTab("profile")}
                style={tabButton(activeTab === "profile")}
              >
                بيانات الحساب
              </button>
              <button
                onClick={() => setActiveTab("password")}
                style={tabButton(activeTab === "password")}
              >
                تغيير كلمة المرور
              </button>
            </div>

            {activeTab === "profile" ? (
              <div>
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
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "#eef2ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4f46e5",
                    }}
                  >
                    <UserRoundPen size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      تعديل بيانات الحساب
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: 14,
                        color: "#6b7280",
                      }}
                    >
                      حدّث اسمك ورقم هاتفك من خلال الملف الشخصي.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 18 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      الاسم
                    </label>
                    <div style={{ position: "relative" }}>
                      <UserCircle2
                        size={18}
                        style={{
                          position: "absolute",
                          left: 15,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                        }}
                      />
                      <input
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="اسمك"
                        style={fieldStyle("name", profileErrors)}
                      />
                    </div>
                    {profileErrors.name && (
                      <p
                        style={{
                          color: "#dc2626",
                          fontSize: 12,
                          margin: "6px 0 0 0",
                        }}
                      >
                        {profileErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      الهاتف
                    </label>
                    <div style={{ position: "relative" }}>
                      <Phone
                        size={18}
                        style={{
                          position: "absolute",
                          left: 15,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                        }}
                      />
                      <input
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+9639xxxxxxxx"
                        style={fieldStyle("phone", profileErrors)}
                      />
                    </div>
                    {profileErrors.phone && (
                      <p
                        style={{
                          color: "#dc2626",
                          fontSize: 12,
                          margin: "6px 0 0 0",
                        }}
                      >
                        {profileErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={updateProfile}
                    disabled={savingProfile}
                    style={{
                      minWidth: 180,
                      padding: "14px 20px",
                      borderRadius: 14,
                      border: "none",
                      background: savingProfile
                        ? "#c7d2fe"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: savingProfile ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {savingProfile ? (
                      <Loader2
                        size={18}
                        style={{ animation: "spin 0.8s linear infinite" }}
                      />
                    ) : (
                      <Save size={18} />
                    )}
                    حفظ الملف الشخصي
                  </button>
                </div>
              </div>
            ) : (
              <div>
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
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "#fff7ed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ea580c",
                    }}
                  >
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      تغيير كلمة المرور
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: 14,
                        color: "#6b7280",
                      }}
                    >
                      استخدم نموذج كلمة المرور المخصص لتحديث بيانات الدخول.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 18 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      كلمة المرور الحالية
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={passwordForm.oldPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            oldPassword: e.target.value,
                          }))
                        }
                        placeholder="كلمة المرور الحالية"
                        style={fieldStyle("oldPassword", passwordErrors)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          left: 15,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#6b7280",
                        }}
                      >
                        {showOldPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.oldPassword && (
                      <p
                        style={{
                          color: "#dc2626",
                          fontSize: 12,
                          margin: "6px 0 0 0",
                        }}
                      >
                        {passwordErrors.oldPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      كلمة المرور الجديدة
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="كلمة المرور الجديدة"
                        style={fieldStyle("newPassword", passwordErrors)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          left: 15,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#6b7280",
                        }}
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p
                        style={{
                          color: "#dc2626",
                          fontSize: 12,
                          margin: "6px 0 0 0",
                        }}
                      >
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: 8,
                      }}
                    >
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="تأكيد كلمة المرور الجديدة"
                        style={fieldStyle("confirmPassword", passwordErrors)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        style={{
                          position: "absolute",
                          left: 15,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#6b7280",
                        }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p
                        style={{
                          color: "#dc2626",
                          fontSize: 12,
                          margin: "6px 0 0 0",
                        }}
                      >
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={updatePassword}
                    disabled={savingPassword}
                    style={{
                      minWidth: 200,
                      padding: "14px 20px",
                      borderRadius: 14,
                      border: "none",
                      background: savingPassword
                        ? "#fed7aa"
                        : "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: savingPassword ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {savingPassword ? (
                      <Loader2
                        size={18}
                        style={{ animation: "spin 0.8s linear infinite" }}
                      />
                    ) : (
                      <Save size={18} />
                    )}
                    تحديث كلمة المرور
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
