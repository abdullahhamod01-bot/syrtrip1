import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  UtensilsCrossed,
  MapPin,
  Star,
  Phone,
  Trash2,
  Search,
  Filter,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Restaurants() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const role = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();
  const userId = user?.id || user?._id || user?.user?.id || user?.user?._id;

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/restaurants", {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
        },
      });

      const restaurantsData = res.data?.restaurants || [];
      setData(restaurantsData);
      setTotalPages(res.data?.meta?.totalPages || 1);
      setTotal(res.data?.meta?.total || restaurantsData.length);
    } catch (err) {
      console.error("Error loading restaurants:", err);
      setData([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, searchQuery]);

  useEffect(() => {
    const result = [...data].sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
      return 0;
    });
    setFilteredData(result);
  }, [sortBy, data]);

  const canManageRestaurant = (restaurant) => {
    const ownerId =
      restaurant.ownerId || restaurant.owner?.id || restaurant.owner?._id;
    return (
      role === "admin" || (role === "restaurant_owner" && ownerId === userId)
    );
  };

  const deleteRestaurant = async (id) => {
    try {
      await API.delete(`/restaurants/${id}`);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      // Fallback for backend typo/alternative route shape.
      if (err?.response?.status === 404) {
        try {
          await API.delete(`/restaurant/${id}`);
          setDeleteConfirm(null);
          load();
          return;
        } catch (fallbackErr) {
          console.error("Error deleting restaurant (fallback):", fallbackErr);
        }
      }
      console.error("Error deleting restaurant:", err);
      alert("تعذر حذف المطعم");
    }
  };

  const renderStars = (rating) => (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= (rating || 0) ? "#fbbf24" : "none"}
          color={star <= (rating || 0) ? "#fbbf24" : "#d1d5db"}
        />
      ))}
      <span
        style={{
          marginLeft: 4,
          fontSize: 13,
          fontWeight: 600,
          color: "#f59e0b",
        }}
      >
        {rating || 0}
      </span>
    </div>
  );

  return (
    <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
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
            المطاعم
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            إدارة قوائم المطاعم وخيارات الطعام
          </p>
        </div>
        {(role === "admin" || role === "restaurant_owner") && (
          <Link
            to="/add-restaurant"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(79,172,254,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <Plus size={18} />
            إضافة مطعم
          </Link>
        )}
      </div>

      <div
        style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}
      >
        <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
          <Search
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
            placeholder="ابحث عن مطعم بالاسم أو الموقع..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "12px 16px 12px 44px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          <Filter size={16} color="#6b7280" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              border: "none",
              background: "none",
              fontSize: 14,
              color: "#374151",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="name">الترتيب حسب الاسم</option>
            <option value="rating">الترتيب حسب التقييم</option>
          </select>
        </div>
      </div>

      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
        عرض <strong style={{ color: "#111827" }}>{filteredData.length}</strong>{" "}
        من أصل <strong style={{ color: "#111827" }}>{total}</strong> مطعم
      </p>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <Loader2
            size={28}
            color="#4facfe"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredData.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "#f9fafb",
            borderRadius: 16,
            border: "2px dashed #e5e7eb",
          }}
        >
          <UtensilsCrossed
            size={48}
            color="#d1d5db"
            style={{ marginBottom: 16 }}
          />
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#374151",
              margin: "0 0 8px 0",
            }}
          >
            لم يتم العثور على مطاعم
          </h3>
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
            {searchQuery ? "حاول تعديل عبارة البحث" : "ابدأ بإضافة أول مطعم"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 24,
          }}
        >
          {filteredData.map((r) => {
            const id = r.id || r._id;
            return (
              <div
                key={id}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)",
                  border: "1px solid #e7eef3",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 214,
                    background: r.images?.[0]
                      ? `url(${r.images[0]}) center/cover`
                      : "linear-gradient(135deg, #dff5ff 0%, #b9e9f1 100%)",
                    position: "relative",
                  }}
                >
                  {!r.images?.[0] && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 16,
                          background: "rgba(255,255,255,0.55)",
                        }}
                      >
                        <ImageIcon size={30} color="#38bdf8" opacity={0.75} />
                      </div>
                      <span
                        style={{
                          color: "#0e7490",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        لا توجد صورة رئيسية
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(15,23,42,0.04) 35%, rgba(15,23,42,0.7) 100%)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.9)",
                      color: "#0e7490",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    مطعم
                  </span>
                  <div
                    style={{
                      position: "absolute",
                      right: 14,
                      bottom: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 10px",
                      borderRadius: 9,
                      background: "rgba(15,23,42,0.78)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <Star
                      size={12}
                      fill="#fbbf24"
                      color="#fbbf24"
                      style={{ marginRight: 4 }}
                    />
                    {Number(r.avgRating || 0).toFixed(1)}
                  </div>
                  {r.images?.length > 1 && (
                    <span
                      style={{
                        position: "absolute",
                        right: 14,
                        top: 14,
                        padding: "6px 9px",
                        borderRadius: 8,
                        background: "rgba(15,23,42,0.72)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {r.images.length} photos
                    </span>
                  )}
                </div>

                <div
                  style={{
                    padding: "20px 20px 18px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 750,
                      color: "#172033",
                      margin: "0 0 10px",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {r.name || "Unnamed restaurant"}
                  </h3>

                  <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      <MapPin size={15} color="#0ea5a8" />
                      <span>{r.location || "Location not specified"}</span>
                    </div>
                    {r.phone && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "#64748b",
                          fontSize: 13,
                        }}
                      >
                        <Phone size={15} color="#0ea5a8" />
                        <span>{r.phone}</span>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderTop: "1px solid #edf2f5",
                      borderBottom: "1px solid #edf2f5",
                    }}
                  >
                    {renderStars(r.avgRating)}
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>
                      {r.isAvailable === false
                        ? "غير متوفر"
                        : "مفتوح للحجز"}
                    </span>
                  </div>

                  {r.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        margin: "13px 0 0",
                        lineHeight: 1.55,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 40,
                      }}
                    >
                      {r.description}
                    </p>
                  )}

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 18,
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 10,
                    }}
                  >
                    {canManageRestaurant(r) ? (
                      <>
                        <Link
                          to={`/edit-restaurant/${id}`}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "11px 12px",
                            borderRadius: 10,
                            border: "none",
                            background: "#0e7490",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            textDecoration: "none",
                          }}
                        >
                          <Eye size={15} />
                          عرض وتعديل
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(id)}
                          aria-label="حذف المطعم"
                          title="حذف المطعم"
                          style={{
                            width: 44,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: "10px",
                            borderRadius: 10,
                            border: "1px solid #fecaca",
                            background: "#fff7f7",
                            color: "#dc2626",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        لا توجد إجراءات متاحة
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.6 : 1,
            }}
          >
            السابق
          </button>
          <span style={{ fontSize: 14, color: "#374151" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              opacity: page >= totalPages ? 0.6 : 1,
            }}
          >
            التالي
          </button>
        </div>
      )}

      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <AlertCircle size={24} color="#dc2626" />
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#111827",
                textAlign: "center",
                margin: "0 0 8px 0",
              }}
            >
              حذف المطعم؟
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                margin: "0 0 24px 0",
              }}
            >
              لا يمكن التراجع عن هذا الإجراء، وسيُحذف المطعم نهائيًا.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                إلغاء
              </button>
              <button
                onClick={() => deleteRestaurant(deleteConfirm)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
