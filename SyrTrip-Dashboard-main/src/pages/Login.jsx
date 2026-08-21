import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await login(email, password);
      const role = (
        loggedInUser?.role ||
        loggedInUser?.user?.role ||
        loggedInUser?.roles?.[0]
      )?.toLowerCase();
      navigate(
        [
          "hotel_owner",
          "restaurant_owner",
          "car_rental_owner",
          "car_owner",
        ].includes(role)
          ? "/owner/dashboard"
          : "/",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "فشل تسجيل الدخول",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 420, margin: "60px auto" }}>
      <h2 style={{ marginBottom: 8 }}>تسجيل الدخول</h2>
      <p style={{ color: "#6b7280", marginTop: 0 }}>
        أدخل بيانات حسابك للمتابعة.
      </p>
      <form
        onSubmit={submit}
        style={{ display: "grid", gap: 12, marginTop: 18 }}
      >
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        {error && <div style={{ color: "#dc2626" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#667eea",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "جار تسجيل الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
