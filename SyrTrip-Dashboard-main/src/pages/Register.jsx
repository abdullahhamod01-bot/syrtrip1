import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nextErrors.email = "أدخل بريدًا إلكترونيًا صالحًا";

    if (!form.password.trim()) nextErrors.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 6)
      nextErrors.password = "يجب ألا تقل كلمة المرور عن 6 أحرف";

    if (!form.confirmPassword.trim())
      nextErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    else if (form.password !== form.confirmPassword)
      nextErrors.confirmPassword = "كلمتا المرور غير متطابقتين";

    if (!form.name.trim()) nextErrors.name = "الاسم مطلوب";
    if (!form.phone.trim()) nextErrors.phone = "رقم الهاتف مطلوب";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) return;

    setLoading(true);
    try {
      await API.post("/auth/register", {
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone.trim(),
      });

      setSuccessMessage(
        "تم إنشاء الحساب بنجاح، جار تحويلك إلى تسجيل الدخول...",
      );
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "14px 16px 14px 46px",
    borderRadius: 14,
    border: `1.5px solid ${errors[fieldName] ? "#fca5a5" : "#e5e7eb"}`,
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    color: "#111827",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .register-card { animation: slideUp 0.5s ease-out; }
      `}</style>

      <div
        className="register-card"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          padding: "40px 32px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 8px 0",
              letterSpacing: -0.5,
            }}
          >
            إنشاء حساب
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            انضم إلى SyrTrip وابدأ استكشاف التجارب السياحية
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

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              البريد الإلكتروني
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
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
                placeholder="customer@example.com"
                value={form.email}
                onChange={handleChange}
                style={inputStyle("email")}
              />
            </div>
            {errors.email && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              الاسم الكامل
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                name="name"
                placeholder="Mohammad Nour"
                value={form.name}
                onChange={handleChange}
                style={inputStyle("name")}
              />
            </div>
            {errors.name && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              رقم الهاتف
            </label>
            <div style={{ position: "relative" }}>
              <Phone
                size={18}
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
                placeholder="+9639XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle("phone")}
              />
            </div>
            {errors.phone && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              كلمة المرور
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                style={inputStyle("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              تأكيد كلمة المرور
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                style={inputStyle("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: loading
                ? "#c7d2fe"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                جار إنشاء الحساب...
              </>
            ) : (
              <>
                <span>إنشاء الحساب</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            لديك حساب بالفعل؟{" "}
            <Link
              to="/login"
              style={{
                color: "#667eea",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              سجّل الدخول من هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
