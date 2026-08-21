import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";

const initialPasswordForm = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function OwnerProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordVisibility, setPasswordVisibility] = useState({
    old: false,
    next: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/users/me");
        const userData = res.data?.user || res.data || {};
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "تعذر تحميل ملفك الشخصي.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const updateProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setMessage({ type: "", text: "" });
    try {
      await API.put("/users/me", {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
      });
      await refreshUser();
      setMessage({
        type: "success",
        text: "تم تحديث بيانات الملف الشخصي بنجاح.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "تعذر تحديث بيانات الملف الشخصي.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({
        type: "error",
        text: "كلمتا المرور الجديدتان غير متطابقتين.",
      });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.",
      });
      return;
    }

    setSavingPassword(true);
    setMessage({ type: "", text: "" });
    try {
      await API.put("/users/me/password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(initialPasswordForm);
      setPasswordVisibility({ old: false, next: false, confirm: false });
      setMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "تعذر تغيير كلمة المرور.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #dbe4ea",
    borderRadius: 10,
    color: "#172033",
    background: "#fff",
    fontSize: 14,
    outline: "none",
  };
  const roleLabel = profile.role ? profile.role.replaceAll("_", " ") : "Owner";

  if (loading)
    return (
      <OwnerLayout>
        <div className="owner-loading-state">جار تحميل ملفك الشخصي...</div>
      </OwnerLayout>
    );

  return (
    <OwnerLayout>
      <div className="owner-page" style={{ maxWidth: 1050, margin: "0 auto" }}>
        <div className="owner-page-header" style={{ marginBottom: 28 }}>
          <p className="owner-section-eyebrow">الحساب</p>
          <h1 style={{ margin: "0 0 8px", color: "#172033", fontSize: 32 }}>
            الملف الشخصي
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 15 }}>
            إدارة بيانات الحساب المرتبط ببوابة المالك.
          </p>
        </div>

        {message.text && (
          <div
            className={
              message.type === "error"
                ? "owner-error-banner"
                : "owner-success-banner"
            }
          >
            {message.text}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(300px, .9fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          <section className="owner-surface" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 14,
                  background: "#e7f3f6",
                  color: "#0e7490",
                }}
              >
                <UserRound size={23} />
              </div>
              <div>
                <h2 style={{ margin: 0, color: "#172033", fontSize: 20 }}>
                  البيانات الشخصية
                </h2>
                <p
                  style={{ margin: "4px 0 0", color: "#7b8794", fontSize: 13 }}
                >
                  يمكن تعديل الاسم ورقم الهاتف فقط.
                </p>
              </div>
            </div>
            <form onSubmit={updateProfile} style={{ display: "grid", gap: 18 }}>
              <label
                style={{
                  display: "grid",
                  gap: 7,
                  color: "#344054",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                الاسم
                <input
                  required
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  style={fieldStyle}
                />
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 7,
                  color: "#344054",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                البريد الإلكتروني{" "}
                <span style={{ color: "#98a2b3", fontWeight: 500 }}>
                  (للقراءة فقط)
                </span>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    color="#98a2b3"
                    style={{ position: "absolute", right: 14, top: 13 }}
                  />
                  <input
                    value={profile.email}
                    readOnly
                    aria-readonly="true"
                    style={{
                      ...fieldStyle,
                      paddingRight: 40,
                      background: "#f6f8fa",
                      color: "#667085",
                    }}
                  />
                </div>
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 7,
                  color: "#344054",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                الهاتف
                <div style={{ position: "relative" }}>
                  <Phone
                    size={16}
                    color="#98a2b3"
                    style={{ position: "absolute", right: 14, top: 13 }}
                  />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    style={{ ...fieldStyle, paddingRight: 40 }}
                  />
                </div>
              </label>
              <button
                className="owner-primary-button"
                type="submit"
                disabled={savingProfile}
                style={{ justifyContent: "center", marginTop: 4 }}
              >
                <Save size={16} />
                {savingProfile ? "جار الحفظ..." : "حفظ الملف الشخصي"}
              </button>
            </form>
          </section>

          <div style={{ display: "grid", gap: 24 }}>
            <section className="owner-surface" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 14,
                    background: "#eaf0ff",
                    color: "#4265b5",
                  }}
                >
                  <KeyRound size={23} />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: "#172033", fontSize: 20 }}>
                    كلمة المرور
                  </h2>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#7b8794",
                      fontSize: 13,
                    }}
                  >
                    حدّث كلمة مرور حسابك بأمان.
                  </p>
                </div>
              </div>
              <form
                onSubmit={updatePassword}
                style={{ display: "grid", gap: 14 }}
              >
                {[
                  {
                    key: "oldPassword",
                    label: "كلمة المرور الحالية",
                    visibility: "old",
                  },
                  {
                    key: "newPassword",
                    label: "كلمة المرور الجديدة",
                    visibility: "next",
                  },
                  {
                    key: "confirmPassword",
                    label: "تأكيد كلمة المرور الجديدة",
                    visibility: "confirm",
                  },
                ].map((field) => (
                  <label
                    key={field.key}
                    style={{
                      display: "grid",
                      gap: 7,
                      color: "#344054",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {field.label}
                    <div style={{ position: "relative" }}>
                      <input
                        required
                        type={
                          passwordVisibility[field.visibility]
                            ? "text"
                            : "password"
                        }
                        value={passwordForm[field.key]}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                        style={{ ...fieldStyle, paddingRight: 42 }}
                      />
                      <button
                        type="button"
                        aria-label={
                          passwordVisibility[field.visibility]
                            ? `Hide ${field.label}`
                            : `Show ${field.label}`
                        }
                        onClick={() =>
                          setPasswordVisibility((current) => ({
                            ...current,
                            [field.visibility]: !current[field.visibility],
                          }))
                        }
                        style={{
                          position: "absolute",
                          right: 10,
                          top: 8,
                          width: 28,
                          height: 28,
                          display: "grid",
                          placeItems: "center",
                          border: 0,
                          background: "transparent",
                          color: "#98a2b3",
                          cursor: "pointer",
                        }}
                      >
                        {passwordVisibility[field.visibility] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </label>
                ))}
                <button
                  className="owner-primary-button"
                  type="submit"
                  disabled={savingPassword}
                  style={{
                    justifyContent: "center",
                    marginTop: 4,
                    background: "#2e5f87",
                  }}
                >
                  {savingPassword ? "جار التحديث..." : "تغيير كلمة المرور"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
