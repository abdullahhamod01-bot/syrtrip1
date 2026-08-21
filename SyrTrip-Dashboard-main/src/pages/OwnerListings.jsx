import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";
import {
  Building2,
  Edit3,
  Hotel,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";

export default function OwnerListings() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;

  const loadListings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/hotels", { params: { page: 1, limit: 100 } });
      const allHotels = Array.isArray(res.data)
        ? res.data
        : res.data?.hotels || [];
      setHotels(
        userId
          ? allHotels.filter((hotel) => {
              const ownerId =
                hotel.ownerId ||
                hotel.owner?.id ||
                hotel.owner?._id ||
                hotel.owner;
              return String(ownerId) === String(userId);
            })
          : allHotels,
      );
    } catch (error) {
      console.error("Error loading listings:", error);
      setError(error.response?.data?.message || "تعذر تحميل فنادقك.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [userId]);

  if (loading) {
    return (
      <OwnerLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <p style={{ color: "#6b7280" }}>جار تحميل القوائم...</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="owner-page" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          className="owner-page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 8px 0",
              }}
            >
              فنادقي
            </h1>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
              راجع قائمة فنادقك وحافظ على تحديث بياناتها.
            </p>
          </div>
          <div
            className="owner-page-actions"
            style={{ display: "flex", gap: 10 }}
          >
            <Link
              to="/owner/listings/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "#fff",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              + إضافة فندق
            </Link>
            <button
              onClick={loadListings}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#374151",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <RefreshCw size={15} /> تحديث
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {hotels.length === 0 ? (
          <div
            className="owner-empty-state"
            style={{
              textAlign: "center",
              padding: "72px 20px",
              background: "#f9fafb",
              borderRadius: 16,
              border: "1px dashed #e5e7eb",
            }}
          >
            <Hotel size={42} color="#c7d2fe" style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#374151", fontSize: 18, margin: "0 0 6px" }}>
              لم يتم العثور على فنادق
            </h3>
            <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
              ستظهر قوائم فنادقك هنا.
            </p>
          </div>
        ) : (
          <div
            className="owner-listings-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: 20,
            }}
          >
            {hotels.map((item) => (
              <div
                className="owner-listing-card"
                key={item.id || item._id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    height: 190,
                    background: item.images?.[0]
                      ? `url(${item.images[0]}) center/cover`
                      : "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!item.images?.[0] && <Building2 size={42} color="#818cf8" />}
                </div>

                {/* Content */}
                <div style={{ padding: 20 }}>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {item.name || "فندق بلا اسم"}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 13,
                      color: "#6b7280",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description || "لم تتم إضافة وصف."}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      padding: "4px 0 16px",
                      borderBottom: "1px solid #f3f4f6",
                      color: "#6b7280",
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <MapPin size={14} color="#667eea" />
                      {item.location || "لم يتم تحديد الموقع"}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Phone size={14} color="#667eea" />
                      {item.phone ||
                        item.phoneNumber ||
                        "لم يتم إضافة رقم هاتف"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {item.pricePerNight != null
                        ? `$${item.pricePerNight}`
                        : "لم يُحدد السعر"}
                      <span
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          fontWeight: 400,
                        }}
                      >
                        {item.pricePerNight != null ? " / ليلة" : ""}
                      </span>
                    </div>
                    <Link
                      to={`/owner/listings/edit/${item.id || item._id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 12px",
                        borderRadius: 9,
                        background: "#eef2ff",
                        color: "#4f46e5",
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <Edit3 size={14} /> تعديل الفندق
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
