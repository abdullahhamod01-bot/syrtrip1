import { useEffect, useState } from "react";
import API from "../api/api";
import {
  Building2,
  CarFront,
  MapPin,
  Phone,
  Navigation,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CarOffices() {
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
      const res = await API.get("/offices", {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
        },
      });
      const officesData = res.data?.offices || [];
      setData(officesData);
      setFilteredData(officesData);
    } catch (err) {
      console.error("Error loading car offices:", err);
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
      if (sortBy === "location")
        return (a.location || "").localeCompare(b.location || "");
      return 0;
    });
    setFilteredData(result);
  }, [sortBy, data]);

  const deleteOffice = async (id) => {
    try {
      await API.delete(`/offices/${id}`);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      console.error("Error deleting car office:", err);
      alert("تعذر حذف مكتب السيارات");
    }
  };

  const role = (
    user?.role ||
    user?.user?.role ||
    (user?.roles && user.roles[0])
  )?.toLowerCase();
  const userId = user?.id || user?._id || user?.user?.id || user?.user?._id;

  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
            }}
          >
            مكاتب السيارات
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "8px 0 0 0" }}>
            إدارة قوائم مكاتب تأجير السيارات
          </p>
        </div>
        {["admin", "car_owner"].includes(role) && (
          <Link
            to="/add-office"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(102,126,234,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(102,126,234,0.3)";
            }}
          >
            <Plus size={18} />
            إضافة مكتب سيارات
          </Link>
        )}
      </div>

      {/* Search & Filter */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 200px",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ position: "relative" }}>
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
            placeholder="ابحث بالاسم أو الموقع..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{
              width: "93%",
              padding: "12px 16px 12px 44px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #e5e7eb",
            fontSize: 14,
            outline: "none",
            cursor: "pointer",
            background: "#fff",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        >
          <option value="name">الترتيب حسب الاسم</option>
          <option value="location">الترتيب حسب الموقع</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
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
            color="#667eea"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
      )}

      {/* No Data */}
      {!loading && data.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            background: "#f9fafb",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <Building2 size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#374151",
              margin: "0 0 8px 0",
            }}
          >
            لم يتم العثور على مكاتب سيارات
          </h3>
          <p style={{ color: "#6b7280", margin: 0 }}>
            {["admin", "car_owner"].includes(role)
              ? "أنشئ أول مكتب سيارات للبدء."
              : "لا تتوفر مكاتب سيارات بعد."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && data.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {filteredData.map((office) => (
            <div
              key={office.id}
              style={{
                background: "#fff",
                borderRadius: 18,
                border: "1px solid #dce7ee",
                overflow: "hidden",
                transition: "all 0.2s",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Header */}
              <div
                style={{
                  minHeight: 132,
                  padding: "20px",
                  background:
                    "linear-gradient(135deg, #142235 0%, #285978 100%)",
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.14)",
                        border: "1px solid rgba(255,255,255,0.18)",
                      }}
                    >
                      <CarFront size={25} color="#f4b860" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          marginBottom: 5,
                          color: "#b8d3e2",
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: 1.2,
                          textTransform: "uppercase",
                        }}
                      >
                        مكتب تأجير
                      </span>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 750,
                          color: "#fff",
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {office.name || "Unnamed office"}
                      </h3>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <CarFront size={16} color="#f4b860" />
                    <span style={{ fontSize: 11, fontWeight: 700 }}>
                      {office._count?.cars ?? 0} سيارة
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    width: 180,
                    height: 180,
                    right: -80,
                    bottom: -115,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                />
              </div>

              {/* Details */}
              <div
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                {/* Location */}
                {office.location && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginBottom: 11,
                      fontSize: 14,
                      color: "#64748b",
                    }}
                  >
                    <MapPin size={16} color="#0e7490" />
                    {office.location}
                  </div>
                )}

                {/* Phone */}
                {office.phone && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginBottom: 11,
                      fontSize: 14,
                      color: "#64748b",
                    }}
                  >
                    <Phone size={16} color="#0e7490" />
                    {office.phone}
                  </div>
                )}

                {/* Description */}
                {office.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      margin: "10px 0 0",
                      lineHeight: 1.55,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {office.description}
                  </p>
                )}

                {/* Coordinates */}
                {(office.lat || office.lng) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#94a3b8",
                      margin: "12px 0 0",
                    }}
                  >
                    <Navigation size={14} color="#f4b860" />{" "}
                    {office.lat?.toFixed(4)}, {office.lng?.toFixed(4)}
                  </div>
                )}

                {/* Car Count */}
                {office._count?.cars !== undefined && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#0e7490",
                      fontWeight: 700,
                      margin: "10px 0 0",
                    }}
                  >
                    <CarFront size={14} /> {office._count.cars} سيارة ضمن الأسطول
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                style={{
                  padding: "16px 20px 20px",
                  borderTop: "1px solid #edf2f5",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                }}
              >
                <Link
                  to={`/edit-office/${office.id}`}
                  style={{
                    padding: "11px 12px",
                    borderRadius: 10,
                    background: "#0e7490",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                >
                  <Eye size={15} />
                  عرض وتعديل
                </Link>
                <button
                  onClick={() => setDeleteConfirm(office.id)}
                  style={{
                    width: 44,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#fff7f7",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fca5a5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fee2e2";
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              maxWidth: 400,
              textAlign: "center",
              boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AlertCircle
              size={48}
              color="#dc2626"
              style={{ marginBottom: 16 }}
            />
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 8px 0",
              }}
            >
              هل تريد الحذف بالفعل?
            </h3>
            <p style={{ color: "#6b7280", margin: "0 0 24px 0" }}>
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 8,
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
                onClick={() => deleteOffice(deleteConfirm)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#dc2626";
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
