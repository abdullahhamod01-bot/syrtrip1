import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import LocationPicker from "../components/LocationPicker";
import {
  Building2,
  MapPin,
  Phone,
  FileText,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Map,
} from "lucide-react";

export default function EditCarOffice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();
  const userId =
    user?.userId ||
    user?.id ||
    user?._id ||
    user?.user?.id ||
    user?.user?._id ||
    null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [office, setOffice] = useState(null);

  // Role protection
  if (role && !["admin", "car_owner", "car_rental_owner"].includes(role)) {
    return (
      <div style={{ padding: 40 }}>
        غير مصرح، يمكن للمديرين ومالكي السيارات فقط تعديل مكاتب السيارات.
      </div>
    );
  }

  const [form, setForm] = useState({
    id: "",
    name: "",
    location: "",
    description: "",
    phone: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const res = await API.get(`/offices/${id}`);
        const item =
          res.data?.carOffice || res.data?.office || res.data || null;
        if (!item) {
          setErrors({ fetch: "Car office not found" });
          setLoading(false);
          return;
        }

        if (
          ["car_owner", "car_rental_owner"].includes(role) &&
          String(
            item.ownerId || item.owner?.id || item.owner?._id || item.owner,
          ) !== String(userId)
        ) {
          setErrors({ fetch: "يمكنك تعديل مكاتب السيارات الخاصة بك فقط" });
          setLoading(false);
          return;
        }

        setOffice(item);
        setForm({
          id: item.id || "",
          name: item.name || "",
          location: item.location || "",
          description: item.description || "",
          phone: item.phone || "",
          lat: item.lat?.toString() || "",
          lng: item.lng?.toString() || "",
        });
      } catch (err) {
        console.error("Error fetching car office:", err);
        setErrors({ fetch: "تعذر تحميل بيانات مكتب السيارات" });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOffice();
  }, [id, role, userId]);

  const handleLocationChange = ({ latitude, longitude }) => {
    setForm((prev) => ({
      ...prev,
      lat: String(latitude),
      lng: String(longitude),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "اسم المكتب مطلوب";
    if (!form.location.trim()) newErrors.location = "الموقع مطلوب";
    if (form.lat && (Number(form.lat) < -90 || Number(form.lat) > 90)) {
      newErrors.lat = "Latitude must be between -90 and 90";
    }
    if (form.lng && (Number(form.lng) < -180 || Number(form.lng) > 180)) {
      newErrors.lng = "Longitude must be between -180 and 180";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const update = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim() || undefined,
        location: form.location.trim() || undefined,
        description: form.description.trim() || "",
        phone: form.phone.trim() || "",
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
      };

      await API.put(`/offices/${id}`, payload);
      setSuccess(true);
      setTimeout(() => {
        navigate(
          role === "car_owner" || role === "car_rental_owner"
            ? "/owner/listings"
            : "/offices",
        );
      }, 1500);
    } catch (err) {
      console.error("Error updating car office:", err);
      setErrors({
        submit:
          err.response?.data?.message ||
          "فشل تحديث مكتب السيارات. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "14px 16px 14px 44px",
    borderRadius: 12,
    border: `1.5px solid ${errors[fieldName] ? "#fca5a5" : "#e5e7eb"}`,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#fff",
    boxSizing: "border-box",
    color: "#111827",
  });

  const inputFocus = (e, fieldName) => {
    if (!errors[fieldName]) {
      e.target.style.borderColor = "#667eea";
      e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.1)";
    }
  };

  const inputBlur = (e, fieldName) => {
    if (!errors[fieldName]) {
      e.target.style.borderColor = "#e5e7eb";
      e.target.style.boxShadow = "none";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Loader2
          size={40}
          color="#667eea"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          جار تحميل بيانات مكتب السيارات...
        </p>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#fef2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={28} color="#dc2626" />
        </div>
        <h2
          style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}
        >
          {errors.fetch}
        </h2>
        <button
          onClick={() => navigate("/offices")}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          العودة إلى مكاتب السيارات
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "scaleIn 0.5s ease-out",
          }}
        >
          <CheckCircle size={40} color="#fff" />
        </div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
          }}
        >
          تم تحديث مكتب السيارات بنجاح!
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          جار تحويلك إلى قائمة مكاتب السيارات...
        </p>
        <style>{`
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <button
        onClick={() => navigate("/offices")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: "#fff",
          color: "#6b7280",
          fontSize: 14,
          cursor: "pointer",
          marginBottom: 24,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#667eea";
          e.currentTarget.style.color = "#667eea";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e5e7eb";
          e.currentTarget.style.color = "#6b7280";
        }}
      >
        <ArrowLeft size={16} />
        العودة إلى مكاتب السيارات
      </button>

      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 8px 0",
          }}
        >
          تعديل مكتب السيارات
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
          يمكنك تعديل تفاصيل المكتب أدناه
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #f3f4f6",
        }}
      >
        {errors.submit && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px",
              borderRadius: 12,
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#dc2626",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            <AlertTriangle size={18} />
            {errors.submit}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {/* ID (Read-only) */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              معرّف المكتب
            </label>
            <input
              type="text"
              value={form.id}
              readOnly
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "1.5px solid #e5e7eb",
                fontSize: 14,
                background: "#f9fafb",
                color: "#6b7280",
                cursor: "not-allowed",
              }}
            />
          </div>

          {/* Name */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              اسم المكتب <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Building2
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
                name="name"
                placeholder="أدخل اسم المكتب"
                value={form.name}
                onChange={handleChange}
                style={inputStyle("name")}
                onFocus={(e) => inputFocus(e, "name")}
                onBlur={(e) => inputBlur(e, "name")}
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

          {/* Location */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              الموقع <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <MapPin
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
                name="location"
                placeholder="حماه - ساحة العاصي"
                value={form.location}
                onChange={handleChange}
                style={inputStyle("location")}
                onFocus={(e) => inputFocus(e, "location")}
                onBlur={(e) => inputBlur(e, "location")}
              />
            </div>
            {errors.location && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.location}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
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
                name="phone"
                placeholder="+9639XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle("phone")}
                onFocus={(e) => inputFocus(e, "phone")}
                onBlur={(e) => inputBlur(e, "phone")}
              />
            </div>
          </div>

          {/* Latitude */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              إحداثيات العرض
            </label>
            <div style={{ position: "relative" }}>
              <Map
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
                name="lat"
                type="number"
                step="0.0001"
                placeholder="35.148"
                value={form.lat}
                onChange={handleChange}
                style={inputStyle("lat")}
                onFocus={(e) => inputFocus(e, "lat")}
                onBlur={(e) => inputBlur(e, "lat")}
              />
            </div>
            {errors.lat && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.lat}
              </p>
            )}
          </div>

          {/* Longitude */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              إحداثيات الطول
            </label>
            <div style={{ position: "relative" }}>
              <Map
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
                name="lng"
                type="number"
                step="0.0001"
                placeholder="36.751"
                value={form.lng}
                onChange={handleChange}
                style={inputStyle("lng")}
                onFocus={(e) => inputFocus(e, "lng")}
                onBlur={(e) => inputBlur(e, "lng")}
              />
            </div>
            {errors.lng && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.lng}
              </p>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onChange={handleLocationChange}
            />
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              الوصف
            </label>
            <div style={{ position: "relative" }}>
              <FileText
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: 16,
                  color: "#9ca3af",
                }}
              />
              <textarea
                name="description"
                placeholder="اكتب وصف المكتب والسيارات والخدمات المتاحة..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                style={{
                  ...inputStyle("description"),
                  padding: "14px 16px 14px 44px",
                  resize: "vertical",
                  minHeight: 100,
                }}
                onFocus={(e) => inputFocus(e, "description")}
                onBlur={(e) => inputBlur(e, "description")}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate("/offices")}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            إلغاء
          </button>
          <button
            onClick={update}
            disabled={saving}
            style={{
              flex: 1,
              padding: "14px 28px",
              borderRadius: 12,
              border: "none",
              background: saving
                ? "#c4b5fd"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: saving ? "none" : "0 4px 12px rgba(102,126,234,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(102,126,234,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102,126,234,0.3)";
              }
            }}
          >
            {saving ? (
              <>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
                يتم الحفظ...
              </>
            ) : (
              <>
                <Save size={18} />
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
