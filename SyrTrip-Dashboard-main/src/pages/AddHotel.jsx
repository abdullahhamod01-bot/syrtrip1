import { useState } from "react";
import API from "../api/api";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";
import {
  Hotel,
  MapPin,
  Star,
  DollarSign,
  Phone,
  Image as ImageIcon,
  FileText,
  Hash,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Map,
  Mail,
  X,
} from "lucide-react";

const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function AddHotel() {
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.pathname.startsWith("/owner/") ? "/owner/listings" : "/hotels";
  const { user } = useAuth();
  const role = (user?.role || user?.user?.role || (user?.roles && user.roles[0]))?.toLowerCase();
  const userEmail = user?.email || user?.user?.email || null;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    ownerEmail: "",
    name: "",
    location: "",
    images: "",
    description: "",
    pricePerNight: "",
    phone: "",
    lat: "",
    lng: "",
    latitude: "",
    longitude: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "lat" ? { latitude: value } : {}),
      ...(name === "lng" ? { longitude: value } : {}),
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleLocationChange = ({ latitude, longitude }) => {
    setForm((prev) => ({ ...prev, latitude: String(latitude), longitude: String(longitude), lat: String(latitude), lng: String(longitude) }));
  };

  if (role && !["admin", "hotel_owner"].includes(role)) {
    return <div style={{ padding: 40 }}>غير مصرح، يمكن للمديرين ومالكي الفنادق فقط إضافة الفنادق.</div>;
  }

  const validate = () => {
    const newErrors = {};
    if (!form.ownerEmail.trim()) newErrors.ownerEmail = "بريد المالك الإلكتروني مطلوب";
    if (form.ownerEmail && !form.ownerEmail.includes("@")) newErrors.ownerEmail = "أدخل بريدًا إلكترونيًا صالحًا";
    if (!form.name.trim()) newErrors.name = "اسم الفندق مطلوب";
    if (!form.location.trim()) newErrors.location = "الموقع مطلوب";
    if (form.lat && (Number(form.lat) < -90 || Number(form.lat) > 90)) {
      newErrors.lat = "يجب أن يكون خط العرض بين -90 و90";
    }
    if (form.lng && (Number(form.lng) < -180 || Number(form.lng) > 180)) {
      newErrors.lng = "يجب أن يكون خط الطول بين -180 و180";
    }
    if (form.pricePerNight && Number(form.pricePerNight) < 0) {
      newErrors.pricePerNight = "لا يمكن أن يكون السعر سالبًا";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingImage(true);
      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrl = res.data?.url || res.data?.imageUrl;
      if (!uploadedUrl) throw new Error("لم يتم إرجاع رابط الصورة المرفوعة");

      const currentImages = form.images
        ? form.images.split(",").map((img) => img.trim()).filter(Boolean)
        : [];

      setForm((prev) => ({
        ...prev,
        images: [...currentImages, uploadedUrl].join(", "),
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
      setErrors((prev) => ({
        ...prev,
        image: err.response?.data?.message || "فشل رفع الصورة. يرجى المحاولة مرة أخرى.",
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const imageUrls = form.images
    ? form.images.split(",").map((image) => image.trim()).filter(Boolean)
    : [];

  const removeImage = (imageIndex) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean)
        .filter((_, index) => index !== imageIndex)
        .join(", "),
    }));
  };

  const submit = async () => {
    console.log("Submit clicked, form state:", form);
    if (!validate()) {
      console.log("Validation failed");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ownerEmail: form.ownerEmail.trim(),
        name: form.name.trim(),
        location: form.location.trim(),
        images: form.images
          ? form.images.split(",").map((img) => img.trim()).filter(Boolean)
          : [],
        description: form.description.trim() || undefined,
        pricePerNight: form.pricePerNight ? Number(form.pricePerNight) : 0,
        phone: form.phone.trim(),
        lat: form.latitude ? Number(form.latitude) : undefined,
        lng: form.longitude ? Number(form.longitude) : undefined,
        isAvailable: true,
      };

      console.log("Sending payload:", payload);
      const response = await API.post("/hotels", payload);
      console.log("Hotel added successfully:", response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate(backPath);
      }, 1500);
    } catch (err) {
      console.error("Error adding hotel:", err);
      console.error("Error details:", err.response?.data);
      setErrors({
        submit: err.response?.data?.message || "فشل إضافة الفندق. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setLoading(false);
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
          تمت إضافة الفندق بنجاح!
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          جار تحويلك إلى قائمة الفنادق...
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
        onClick={() => navigate(backPath)}
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
          العودة إلى {location.pathname.startsWith("/owner/") ? "فنادقي" : "الفنادق"}
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
          إضافة فندق جديد
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
          أدخل التفاصيل التالية لإضافة فندق جديد إلى قوائمك.
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
          {/* Owner Email */}
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
              البريد الإلكتروني للمالك <span style={{ color: "#dc2626" }}>*</span>
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
                name="ownerEmail"
                type="email"
                placeholder="hotel@example.com"
                value={form.ownerEmail}
                onChange={handleChange}
                style={inputStyle("ownerEmail")}
                onFocus={(e) => inputFocus(e, "ownerEmail")}
                onBlur={(e) => inputBlur(e, "ownerEmail")}
              />
            </div>
            {errors.ownerEmail && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
                {errors.ownerEmail}
              </p>
            )}
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
              اسم الفندق <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Hotel
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
                placeholder="أدخل اسم الفندق"
                value={form.name}
                onChange={handleChange}
                style={inputStyle("name")}
                onFocus={(e) => inputFocus(e, "name")}
                onBlur={(e) => inputBlur(e, "name")}
              />
            </div>
            {errors.name && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
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
                placeholder="المدينة، الدولة"
                value={form.location}
                onChange={handleChange}
                style={inputStyle("location")}
                onFocus={(e) => inputFocus(e, "location")}
                onBlur={(e) => inputBlur(e, "location")}
              />
            </div>
            {errors.location && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
                {errors.location}
              </p>
            )}
          </div>

          {/* Phone */}
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
              رقم الهاتف <span style={{ color: "#999", fontSize: 12 }}>(اختياري)</span>
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
                placeholder="0912345678"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle("phone")}
                onFocus={(e) => inputFocus(e, "phone")}
                onBlur={(e) => inputBlur(e, "phone")}
              />
            </div>
            {errors.phone && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
                {errors.phone}
              </p>
            )}
          </div>
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
              خط العرض
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
                placeholder="35.656"
                value={form.lat}
                onChange={handleChange}
                style={inputStyle("lat")}
                onFocus={(e) => inputFocus(e, "lat")}
                onBlur={(e) => inputBlur(e, "lat")}
              />
            </div>
            {errors.lat && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
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
              خط الطول
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
                placeholder="36.254"
                value={form.lng}
                onChange={handleChange}
                style={inputStyle("lng")}
                onFocus={(e) => inputFocus(e, "lng")}
                onBlur={(e) => inputBlur(e, "lng")}
              />
            </div>
            {errors.lng && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
                {errors.lng}
              </p>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <LocationPicker lat={form.latitude} lng={form.longitude} onChange={handleLocationChange} />
          </div>

          {/* Price Per Night */}
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
              السعر لكل ليلة
            </label>
            <div style={{ position: "relative" }}>
              <DollarSign
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
                name="pricePerNight"
                type="number"
                min="0"
                placeholder="150"
                value={form.pricePerNight}
                onChange={handleChange}
                style={inputStyle("pricePerNight")}
                onFocus={(e) => inputFocus(e, "pricePerNight")}
                onBlur={(e) => inputBlur(e, "pricePerNight")}
              />
            </div>
            {errors.pricePerNight && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
                {errors.pricePerNight}
              </p>
            )}
          </div>

          {/* Images */}
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
              الصور
            </label>

            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                  e.target.value = "";
                }}
                style={{
                  fontSize: 12,
                  color: "#374151",
                }}
              />
              {uploadingImage && <span style={{ fontSize: 12, color: "#667eea" }}>جار رفع الصورة...</span>}
            </div>
            {imageUrls.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginTop: 16 }}>
                {imageUrls.map((image, index) => (
                  <div key={`${image}-${index}`} style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", borderRadius: 12, background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                    <img src={image} alt={`معاينة الفندق ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <button type="button" onClick={() => removeImage(index)} aria-label={`حذف الصورة ${index + 1}`} title="حذف الصورة" style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, display: "grid", placeItems: "center", border: "none", borderRadius: "50%", background: "rgba(17,24,39,0.78)", color: "#fff", cursor: "pointer" }}><X size={15} /></button>
                    {index === 0 && <span style={{ position: "absolute", left: 8, bottom: 8, padding: "4px 7px", borderRadius: 6, background: "rgba(17,24,39,0.72)", color: "#fff", fontSize: 11, fontWeight: 700 }}>الصورة الرئيسية</span>}
                  </div>
                ))}
              </div>
            )}
            {errors.image && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>{errors.image}</p>
            )}
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
                placeholder="اكتب وصف الفندق ومرافقه وميزاته الفريدة..."
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
            onClick={() => navigate(backPath)}
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
            type="button"
            onClick={() => {
              console.log("Add Hotel button clicked");
              submit();
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px 28px",
              borderRadius: 12,
              border: "none",
              background: loading
                ? "#c4b5fd"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: loading
                ? "none"
                : "0 4px 12px rgba(102,126,234,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(102,126,234,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102,126,234,0.3)";
              }
            }}
          >
            {loading ? (
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
                جار الإضافة...
              </>
            ) : (
              <>
                <Save size={18} />
                إضافة الفندق
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}