import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

const roleOptions = [
  {
    value: "ADMIN",
    label: "مدير",
    description:
      "يمكنه إدارة المستخدمين والقوائم والحجوزات وإعدادات لوحة التحكم",
  },
  {
    value: "CUSTOMER",
    label: "عميل",
    description: "يمكنه إجراء الحجوزات وإدارة نشاطه الشخصي",
  },
];

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  phone: "",
  role: "CUSTOMER",
};

export default function AddUser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentRole = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (currentRole !== "admin") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ color: "#111827", margin: "0 0 8px" }}>غير مصرح</h2>
        <p style={{ color: "#6b7280" }}>
          يمكن للمديرين فقط إنشاء حسابات المستخدمين.
        </p>
      </div>
    );
  }

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: "" }));
    }
    setSuccessMessage("");
    setErrorMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = "البريد الإلكتروني مطلوب";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email = "أدخل بريدًا إلكترونيًا صالحًا";

    if (!form.name.trim()) nextErrors.name = "الاسم الكامل مطلوب";
    if (!form.phone.trim()) nextErrors.phone = "رقم الهاتف مطلوب";

    if (!form.password) nextErrors.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 8)
      nextErrors.password = "يجب ألا تقل كلمة المرور عن 8 أحرف";

    if (!form.confirmPassword)
      nextErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    else if (form.password !== form.confirmPassword)
      nextErrors.confirmPassword = "كلمتا المرور غير متطابقتين";

    if (!form.role) nextErrors.role = "اختر صلاحية الحساب";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validate()) return;

    setLoading(true);
    try {
      await API.post("/auth/register", {
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone.trim(),
        role: form.role,
      });

      const selectedRole = roleOptions.find(
        (option) => option.value === form.role,
      );
      setSuccessMessage(
        `تم إنشاء حساب ${selectedRole?.label || "المستخدم"} بنجاح.`,
      );
      setForm(initialForm);
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage(
        error.response?.data?.message || "فشل إنشاء حساب المستخدم.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "13px 14px 13px 44px",
    borderRadius: 12,
    border: `1.5px solid ${errors[fieldName] ? "#fca5a5" : "#e5e7eb"}`,
    color: "#111827",
    background: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  });

  return (
    <div style={{ padding: "32px", maxWidth: 980, margin: "0 auto" }}>
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "#6b7280",
          fontSize: 14,
          textDecoration: "none",
          marginBottom: 22,
        }}
      >
        <ArrowLeft size={16} />
        العودة إلى لوحة التحكم
      </Link>

      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            color: "#111827",
            fontSize: 32,
            fontWeight: 800,
            margin: "0 0 8px",
          }}
        >
          إنشاء مستخدم جديد
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
          أنشئ حسابًا وحدد صلاحية الوصول المناسبة.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderRadius: 14,
            background: "#ecfdf5",
            border: "1px solid #bbf7d0",
            color: "#166534",
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderRadius: 14,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          <AlertTriangle size={18} />
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <section
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 28,
            border: "1px solid #eef2f7",
            boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#eef2ff",
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ color: "#111827", fontSize: 19, margin: 0 }}>
                بيانات الحساب
              </h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
                سيتمكن المستخدم من تسجيل الدخول بهذه البيانات.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 7,
                }}
              >
                الاسم الكامل
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={17}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  name="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="محمد عبد الله"
                  style={inputStyle("name")}
                />
              </div>
              {errors.name && (
                <p
                  style={{ color: "#dc2626", fontSize: 12, margin: "5px 0 0" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 7,
                }}
              >
                البريد الإلكتروني
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={17}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="customer@example.com"
                  style={inputStyle("email")}
                />
              </div>
              {errors.email && (
                <p
                  style={{ color: "#dc2626", fontSize: 12, margin: "5px 0 0" }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 7,
                }}
              >
                رقم الهاتف
              </label>
              <div style={{ position: "relative" }}>
                <Phone
                  size={17}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+9639XXXXXXXX"
                  style={inputStyle("phone")}
                />
              </div>
              {errors.phone && (
                <p
                  style={{ color: "#dc2626", fontSize: 12, margin: "5px 0 0" }}
                >
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 7,
                }}
              >
                كلمة المرور
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="8 أحرف على الأقل"
                  style={inputStyle("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p
                  style={{ color: "#dc2626", fontSize: 12, margin: "5px 0 0" }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 7,
                }}
              >
                تأكيد كلمة المرور
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  placeholder="أعد إدخال كلمة المرور"
                  style={inputStyle("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  style={{ color: "#dc2626", fontSize: 12, margin: "5px 0 0" }}
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </section>

        <aside
          style={{
            background: "#111827",
            borderRadius: 20,
            padding: 24,
            color: "#fff",
            boxShadow: "0 12px 28px rgba(15,23,42,0.16)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <ShieldCheck size={20} color="#c7d2fe" />
            <h2 style={{ fontSize: 18, margin: 0 }}>صلاحية الحساب</h2>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
              lineHeight: 1.5,
              margin: "0 0 18px",
            }}
          >
            اختر الصلاحيات التي سيحصل عليها هذا الحساب.
          </p>

          <div style={{ display: "grid", gap: 8 }}>
            {roleOptions.map((option) => {
              const selected = form.role === option.value;
              return (
                <label
                  key={option.value}
                  style={{
                    display: "block",
                    padding: "12px 13px",
                    borderRadius: 12,
                    border: `1px solid ${selected ? "#a5b4fc" : "rgba(255,255,255,0.12)"}`,
                    background: selected
                      ? "rgba(99,102,241,0.28)"
                      : "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selected}
                    onChange={(event) =>
                      updateField("role", event.target.value)
                    }
                    style={{
                      position: "absolute",
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    style={{
                      display: "block",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {option.label}
                  </span>
                  <span
                    style={{
                      display: "block",
                      color: "rgba(255,255,255,0.62)",
                      fontSize: 11,
                      lineHeight: 1.4,
                      marginTop: 4,
                    }}
                  >
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.role && (
            <p style={{ color: "#fca5a5", fontSize: 12, margin: "8px 0 0" }}>
              {errors.role}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 22,
              padding: "13px 16px",
              borderRadius: 12,
              border: "none",
              background: loading
                ? "#6b7280"
                : "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <Loader2
                size={17}
                style={{ animation: "spin 0.8s linear infinite" }}
              />
            ) : (
              <UserPlus size={17} />
            )}
            {loading ? "جار إنشاء الحساب..." : "إنشاء الحساب"}
          </button>
        </aside>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 760px) { form { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
