import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import LocationPicker from "../components/LocationPicker";
import {
  MapPin,
  Image as ImageIcon,
  FileText,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Map,
  X,
} from "lucide-react";

export default function EditLandmark() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (role && role !== "admin") {
    return (
      <div style={{ padding: 40 }}>
        غير مصرح، يمكن للمديرين فقط تعديل المعالم.
      </div>
    );
  }

  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    lat: "",
    lng: "",
    images: "",
  });

  useEffect(() => {
    const fetchLandmark = async () => {
      try {
        const res = await API.get(`/landmarks/${id}`);
        const item = res.data?.landmark || res.data || null;
        if (!item) {
          setErrors({ fetch: "Landmark not found" });
          setLoading(false);
          return;
        }

        setForm({
          name: item.name || "",
          location: item.location || "",
          description: item.description || "",
          lat: item.lat?.toString() || "",
          lng: item.lng?.toString() || "",
          images: Array.isArray(item.images) ? item.images.join(", ") : "",
        });
      } catch (err) {
        console.error("Error fetching landmark:", err);
        setErrors({ fetch: "تعذر تحميل بيانات المعلم" });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLandmark();
  }, [id]);

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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "اسم المعلم مطلوب";
    if (!form.location.trim()) newErrors.location = "الموقع مطلوب";
    if (form.lat && (Number(form.lat) < -90 || Number(form.lat) > 90))
      newErrors.lat = "يجب أن يكون خط العرض بين -90 و90";
    if (form.lng && (Number(form.lng) < -180 || Number(form.lng) > 180))
      newErrors.lng = "Longitude must be between -180 and 180";
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
        headers: { "Content-Type": "multipart/form-data" },
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
      setErrors((prev) => ({
        ...prev,
        image:
          err.response?.data?.message ||
          "فشل رفع الصورة. يرجى المحاولة مرة أخرى.",
      }));
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
  const removeImage = (imageIndex) =>
    setForm((prev) => ({
      ...prev,
      images: prev.images
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean)
        .filter((_, index) => index !== imageIndex)
        .join(", "),
    }));

  const update = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || "",
        location: form.location.trim(),
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        images: form.images
          ? form.images
              .split(",")
              .map((img) => img.trim())
              .filter(Boolean)
          : [],
      };

      await API.put(`/landmarks/${id}`, payload);
      setSuccess(true);
      setTimeout(() => navigate("/landmarks"), 1500);
    } catch (err) {
      console.error("Error updating landmark:", err);
      setErrors({
        submit:
          err.response?.data?.message ||
          "Failed to update landmark. Please try again.",
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
    background: "#fff",
    boxSizing: "border-box",
    color: "#111827",
  });

  const inputFocus = (e, fieldName) => {
    if (!errors[fieldName]) {
      e.target.style.borderColor = "#f59e0b";
      e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.1)";
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
          color="#f59e0b"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          جار تحميل بيانات المعلم...
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
          onClick={() => navigate("/landmarks")}
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
          العودة إلى المعالم
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
          }}
        >
          <CheckCircle size={40} color="#fff" />
        </div>
        <h2
          style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}
        >
          تم تحديث المعلم بنجاح!
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          جار تحويلك إلى قائمة المعالم...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
      <button
        onClick={() => navigate("/landmarks")}
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
        }}
      >
        <ArrowLeft size={16} />
        العودة إلى المعالم
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
          تعديل المعلم
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
          حدّث تفاصيل المعلم أدناه.
        </p>
      </div>

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
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
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
              اسم المعلم <span style={{ color: "#dc2626" }}>*</span>
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
                name="name"
                placeholder="أدخل اسم المعلم"
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
                placeholder="مثال: حلب"
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
                placeholder="35.265"
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
                placeholder="36.354"
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
                placeholder="اكتب وصف المعلم وأهميته..."
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
              Images
            </label>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e.target.files?.[0])}
                disabled={uploadingImage}
                style={{ flex: 1, minWidth: 220 }}
              />
              {uploadingImage && (
                <span style={{ color: "#f59e0b", fontSize: 13 }}>
                  جار رفع الصورة...
                </span>
              )}
            </div>
            {errors.image && (
              <p
                style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}
              >
                {errors.image}
              </p>
            )}
            {imageUrls.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 12,
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
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={image}
                      alt={`Landmark view ${index + 1}`}
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
                      title="Remove image"
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
          </div>
        </div>

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
            onClick={() => navigate("/landmarks")}
            style={{
              padding: "14px 28px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={update}
            disabled={saving || uploadingImage}
            style={{
              flex: 1,
              padding: "14px 28px",
              borderRadius: 12,
              border: "none",
              background:
                saving || uploadingImage
                  ? "#fbbf24"
                  : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: saving || uploadingImage ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
