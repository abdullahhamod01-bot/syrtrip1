import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
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
  Loader2,
  X,
} from "lucide-react";

export default function EditHotel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.pathname.startsWith("/owner/")
    ? "/owner/listings"
    : "/hotels";
  const { user } = useAuth();
  const role = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [hotel, setHotel] = useState(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    location: "",
    images: "",
    description: "",
    pricePerNight: "",
    phoneNumber: "",
    isAvailable: true,
    lat: "",
    lng: "",
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await API.get(`/hotels/${id}`);
        const item = res.data?.hotel || res.data || null;
        if (!item) {
          setErrors({ fetch: "لم يتم العثور على الفندق" });
          setLoading(false);
          return;
        }

        setHotel(item);
        setForm({
          id: item.id || item._id || "",
          name: item.name || "",
          location: item.location || "",
          images: Array.isArray(item.images) ? item.images.join(", ") : "",

          description: item.description || "",
          pricePerNight: item.pricePerNight?.toString() || "",
          phoneNumber: item.phone || item.phoneNumber || "",
          isAvailable: item.isAvailable !== false,
          lat: item.lat?.toString() || "",
          lng: item.lng?.toString() || "",
        });
      } catch (err) {
        console.error("Error fetching hotel:", err);
        setErrors({ fetch: "تعذر تحميل بيانات الفندق" });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHotel();
  }, [id]);

  if (role && !["admin", "hotel_owner"].includes(role)) {
    return (
      <div style={{ padding: 40 }}>
        غير مصرح، يمكن للمديرين ومالكي الفنادق فقط تعديل الفنادق.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleLocationChange = ({ latitude, longitude }) => {
    setForm((prev) => ({
      ...prev,
      lat: String(latitude),
      lng: String(longitude),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "اسم الفندق مطلوب";
    if (!form.location.trim()) newErrors.location = "الموقع مطلوب";
    if (form.rating && (Number(form.rating) < 0 || Number(form.rating) > 5)) {
      newErrors.rating = "Rating must be between 0 and 5";
    }
    if (form.pricePerNight && Number(form.pricePerNight) < 0) {
      newErrors.pricePerNight = "Price cannot be negative";
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
        ? form.images
            .split(",")
            .map((img) => img.trim())
            .filter(Boolean)
        : [];

      setForm((prev) => ({
        ...prev,
        images: [...currentImages, uploadedUrl].join(", "),
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
      setErrors({
        image:
          err.response?.data?.message ||
          "فشل رفع الصورة. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const imageUrls = form.images
    ? form.images
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean)
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

  const update = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const images = form.images
        ? form.images
            .split(",")
            .map((img) => img.trim())
            .filter(Boolean)
        : [];

      const payload = {
        name: form.name.trim() || undefined,
        location: form.location.trim() || undefined,
        description: form.description.trim() || "",
        phone: form.phoneNumber.trim() || "",
        images,
        pricePerNight:
          form.pricePerNight !== "" ? Number(form.pricePerNight) : undefined,
        isAvailable: form.isAvailable,
        lat: form.lat ? Number(form.lat) : (hotel?.lat ?? undefined),
        lng: form.lng ? Number(form.lng) : (hotel?.lng ?? undefined),
      };

      await API.put(`/hotels/${id}`, payload);
      setSuccess(true);
      setTimeout(() => {
        navigate(backPath);
      }, 1500);
    } catch (err) {
      console.error("Error updating hotel:", err);
      setErrors({
        submit:
          err.response?.data?.message ||
          "فشل تحديث الفندق. يرجى المحاولة مرة أخرى.",
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
          جار تحميل بيانات الفندق...
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
          onClick={() => navigate(backPath)}
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
          العودة إلى{" "}
          {location.pathname.startsWith("/owner/") ? "فنادقي" : "الفنادق"}
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
          تم تحديث الفندق بنجاح!
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
        العودة إلى{" "}
        {location.pathname.startsWith("/owner/") ? "فنادقي" : "الفنادق"}
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
          عرض وتعديل الفندق
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
          راجع تفاصيل الفندق وأدر معرض الصور وحدّث البيانات القابلة للتعديل.
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
          {/* ID */}
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
              معرّف الفندف <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Hash
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
                name="id"
                value={form.id}
                readOnly
                disabled
                style={{
                  ...inputStyle("id"),
                  background: "#f3f4f6",
                  cursor: "not-allowed",
                }}
              />
            </div>
            {errors.id && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.id}
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
                placeholder="Enter hotel name"
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
                placeholder="City, Country"
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
              السعر لليلة الواحدة ($)
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
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.pricePerNight}
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
              التوفر للحجز
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 46,
                padding: "0 14px",
                borderRadius: 12,
                border: "1.5px solid #e5e7eb",
                color: "#374151",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isAvailable: e.target.checked,
                  }))
                }
                style={{ width: 18, height: 18, accentColor: "#667eea" }}
              />
              متاح للحجز
            </label>
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
                name="phoneNumber"
                placeholder="+1 234 567 890"
                value={form.phoneNumber}
                onChange={handleChange}
                style={inputStyle("phoneNumber")}
                onFocus={(e) => inputFocus(e, "phoneNumber")}
                onBlur={(e) => inputBlur(e, "phoneNumber")}
              />
            </div>
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

            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
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
              {uploadingImage && (
                <span style={{ fontSize: 12, color: "#667eea" }}>
                  جار رفع الصورة...
                </span>
              )}
            </div>
            {imageUrls.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {imageUrls.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    style={{
                      position: "relative",
                      aspectRatio: "4 / 3",
                      overflow: "hidden",
                      borderRadius: 12,
                      background: "#f3f4f6",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={image}
                      alt={`${form.name || "Hotel"} view ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove image ${index + 1}`}
                      title="حذف الصورة"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        display: "grid",
                        placeItems: "center",
                        border: "none",
                        borderRadius: "50%",
                        background: "rgba(17,24,39,0.78)",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <X size={15} />
                    </button>
                    {index === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          left: 8,
                          bottom: 8,
                          padding: "4px 7px",
                          borderRadius: 6,
                          background: "rgba(17,24,39,0.72)",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        الصورة الرئيسية
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {errors.image && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.image}
              </p>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                إحداثيات العرض
                <input
                  name="lat"
                  type="number"
                  step="0.000001"
                  value={form.lat}
                  onChange={handleChange}
                  style={{ ...inputStyle("lat"), marginTop: 8 }}
                />
              </label>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                إحداثيات الطول
                <input
                  name="lng"
                  type="number"
                  step="0.000001"
                  value={form.lng}
                  onChange={handleChange}
                  style={{ ...inputStyle("lng"), marginTop: 8 }}
                />
              </label>
            </div>
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
                placeholder="اكتب وصفا مناسبا..."
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
                <Loader2
                  size={18}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
