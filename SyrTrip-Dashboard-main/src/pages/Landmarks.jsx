import { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Star,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

export default function Landmarks() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/landmarks", {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
        },
      });
      const landmarksData = res.data?.landmarks || [];
      setData(landmarksData);
      setFilteredData(landmarksData);
    } catch (err) {
      console.error("Error loading landmarks:", err);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, searchQuery]);

  useEffect(() => {
    let result = [...data];
    result.sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "rating")
        return (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0);
      return 0;
    });
    setFilteredData(result);
  }, [sortBy, data]);

  const deleteLandmark = async (id) => {
    try {
      await API.delete(`/landmarks/${id}`);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      console.error("Error deleting landmark:", err);
      alert("تعذر حذف المعلم");
    }
  };

  const role = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();

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
            المعالم
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            إدارة المعالم السياحية والمواقع التاريخية
          </p>
        </div>
        {role === "admin" && (
          <Link
            to="/add-landmark"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
            }}
          >
            <Plus size={18} />
            إضافة معلم
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
            placeholder="ابحث عن معلم بالاسم أو الموقع..."
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
        من أصل <strong style={{ color: "#111827" }}>{data.length}</strong> معلم
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
            size={24}
            color="#f59e0b"
            style={{ animation: "spin 1s linear infinite" }}
          />
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
          <MapPin size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#374151",
              margin: "0 0 8px 0",
            }}
          >
            لم يتم العثور على معالم
          </h3>
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
            {searchQuery ? "حاول تعديل عبارة البحث" : "ابدأ بإضافة أول معلم"}
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
          {filteredData.map((landmark) => (
            <div
              key={landmark.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
                border: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  height: 180,
                  background: landmark.images?.[0]
                    ? `url(${landmark.images[0]}) center/cover`
                    : "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.35) 100%)",
                  position: "relative",
                }}
              >
                {!landmark.images?.[0] && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ImageIcon size={36} color="#f59e0b" opacity={0.4} />
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Star size={12} fill="#fbbf24" color="#fbbf24" />
                  {Number(landmark.avgRating || 0).toFixed(1)}
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#111827",
                    margin: "0 0 8px 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {landmark.name}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  <MapPin size={14} color="#9ca3af" />
                  <span
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {landmark.location || "No location specified"}
                  </span>
                </div>

                {landmark.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      margin: "12px 0 0 0",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {landmark.description}
                  </p>
                )}

                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <Link
                    to={`/edit-landmark/${landmark.id}`}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "#fef3c7",
                      color: "#92400e",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    عرض وتعديل
                  </Link>
                  {role === "admin" && (
                    <button
                      onClick={() => setDeleteConfirm(landmark.id)}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #fee2e2",
                        background: "#fef2f2",
                        color: "#dc2626",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Trash2 size={14} /> حذف
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={() => setDeleteConfirm(null)}
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
            onClick={(e) => e.stopPropagation()}
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
              هل تريد الحذف بالفعل?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                margin: "0 0 24px 0",
              }}
            >
              لا يمكن التراجع عن هذا الإجراء، وسيُحذف المعلم نهائيًا.
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
                onClick={() => deleteLandmark(deleteConfirm)}
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
