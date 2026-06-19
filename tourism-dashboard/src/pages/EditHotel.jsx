import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
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
} from "lucide-react";

export default function EditHotel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    id: "",
    name: "",
    location: "",
    images: "",
    rating: "",
    description: "",
    pricePerNight: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await API.get("/hotels");
        const item = res.data.find((h) => h._id === id);
        if (!item) {
          setErrors({ fetch: "Hotel not found" });
          setLoading(false);
          return;
        }
        setForm({
          id: item.id || "",
          name: item.name || "",
          location: item.location || "",
          images: Array.isArray(item.images) ? item.images.join(", ") : item.images || "",
          rating: item.rating?.toString() || "",
          description: item.description || "",
          pricePerNight: item.pricePerNight?.toString() || "",
          phoneNumber: item.phoneNumber || "",
        });
      } catch (err) {
        console.error("Error fetching hotel:", err);
        setErrors({ fetch: "Failed to load hotel data" });
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.id.trim()) newErrors.id = "Hotel ID is required";
    if (!form.name.trim()) newErrors.name = "Hotel name is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (form.rating && (Number(form.rating) < 0 || Number(form.rating) > 5)) {
      newErrors.rating = "Rating must be between 0 and 5";
    }
    if (form.pricePerNight && Number(form.pricePerNight) < 0) {
      newErrors.pricePerNight = "Price cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const update = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        id: form.id.trim(),
        name: form.name.trim(),
        location: form.location.trim(),
        images: form.images
          ? form.images.split(",").map((img) => img.trim()).filter(Boolean)
          : [],
        rating: form.rating ? Number(form.rating) : 0,
        description: form.description.trim(),
        pricePerNight: form.pricePerNight ? Number(form.pricePerNight) : 0,
        phoneNumber: form.phoneNumber.trim(),
      };

      await API.put(`/hotels/${id}`, payload);
      setSuccess(true);
      setTimeout(() => {
        navigate("/hotels");
      }, 1500);
    } catch (err) {
      console.error("Error updating hotel:", err);
      setErrors({
        submit: err.response?.data?.message || "Failed to update hotel. Please try again.",
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
        <Loader2 size={40} color="#667eea" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading hotel data...</p>
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
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>
          {errors.fetch}
        </h2>
        <button
          onClick={() => navigate("/hotels")}
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
          Back to Hotels
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
          Hotel Updated Successfully!
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          Redirecting to hotels list...
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
        onClick={() => navigate("/hotels")}
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
        Back to Hotels
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
          Edit Hotel
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
          Update the hotel information below.
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
              Hotel ID <span style={{ color: "#dc2626" }}>*</span>
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
                placeholder="e.g., hotel-001"
                value={form.id}
                onChange={handleChange}
                style={inputStyle("id")}
                onFocus={(e) => inputFocus(e, "id")}
                onBlur={(e) => inputBlur(e, "id")}
              />
            </div>
            {errors.id && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
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
              Hotel Name <span style={{ color: "#dc2626" }}>*</span>
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
              Location <span style={{ color: "#dc2626" }}>*</span>
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
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
                {errors.location}
              </p>
            )}
          </div>

          {/* Rating & Price */}
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
              Rating (0-5)
            </label>
            <div style={{ position: "relative" }}>
              <Star
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
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
                value={form.rating}
                onChange={handleChange}
                style={inputStyle("rating")}
                onFocus={(e) => inputFocus(e, "rating")}
                onBlur={(e) => inputBlur(e, "rating")}
              />
            </div>
            {errors.rating && (
              <p style={{ color: "#dc2626", fontSize: 12, margin: "6px 0 0 0" }}>
                {errors.rating}
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
              Price per Night ($)
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
              Phone Number
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
              Images URLs
            </label>
            <div style={{ position: "relative" }}>
              <ImageIcon
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: 16,
                  color: "#9ca3af",
                }}
              />
              <textarea
                name="images"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                value={form.images}
                onChange={handleChange}
                rows={3}
                style={{
                  ...inputStyle("images"),
                  padding: "14px 16px 14px 44px",
                  resize: "vertical",
                  minHeight: 80,
                }}
                onFocus={(e) => inputFocus(e, "images")}
                onBlur={(e) => inputBlur(e, "images")}
              />
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#9ca3af",
                margin: "6px 0 0 0",
              }}
            >
              Separate multiple URLs with commas
            </p>
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
              Description
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
                placeholder="Describe the hotel, its amenities, and unique features..."
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
            onClick={() => navigate("/hotels")}
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
            Cancel
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
              boxShadow: saving
                ? "none"
                : "0 4px 12px rgba(102,126,234,0.3)",
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
                <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}