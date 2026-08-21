import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  CalendarDays,
  MapPin,
  Clock3,
  Image as ImageIcon,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Events() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/events", {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
          upcoming: false,
        },
      });

      const eventsData = res.data?.events || [];
      setData(eventsData);
      setFilteredData(eventsData);
      setTotalPages(res.data?.meta?.totalPages || 1);
      setTotal(res.data?.meta?.total || eventsData.length);
    } catch (err) {
      console.error("Error loading events:", err);
      setData([]);
      setFilteredData([]);
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
      if (sortBy === "date")
        return new Date(a.startDate || 0) - new Date(b.startDate || 0);
      return 0;
    });
    setFilteredData(result);
  }, [sortBy, data]);

  const deleteEvent = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("تعذر حذف الفعالية");
    }
  };

  const formatDate = (value) => {
    if (!value) return "TBD";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            الفعاليات
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            إدارة الفعاليات القادمة والجارية
          </p>
        </div>
        {role === "admin" && (
          <Link
            to="/add-event"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
            }}
          >
            <Plus size={18} />
            إضافة فعالية
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
            placeholder="ابحث عن فعالية بالاسم أو الموقع..."
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
            <option value="date">الترتيب حسب التاريخ</option>
            <option value="name">الترتيب حسب الاسم</option>
          </select>
        </div>
      </div>

      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
        عرض <strong style={{ color: "#111827" }}>{filteredData.length}</strong>{" "}
        من أصل <strong style={{ color: "#111827" }}>{total}</strong> فعالية
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
            color="#8b5cf6"
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
          <CalendarDays
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
            لم يتم العثور على فعاليات
          </h3>
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
            {searchQuery ? "حاول تعديل عبارة البحث" : "ابدأ بإضافة أول فعالية"}
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
          {filteredData.map((event) => {
            const id = event.id || event._id;
            return (
              <div
                key={id}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)",
                  border: "1px solid #ece9f6",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 214,
                    background: event.images?.[0]
                      ? `url(${event.images[0]}) center/cover`
                      : "linear-gradient(135deg, #eee8ff 0%, #f6d8f2 100%)",
                    position: "relative",
                  }}
                >
                  {!event.images?.[0] && (
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
                          background: "rgba(255,255,255,0.58)",
                        }}
                      >
                        <ImageIcon size={30} color="#8b5cf6" opacity={0.75} />
                      </div>
                      <span
                        style={{
                          color: "#6d28d9",
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
                        "linear-gradient(180deg, rgba(15,23,42,0.04) 35%, rgba(15,23,42,0.72) 100%)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.92)",
                      color: "#6d28d9",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {event.type || "فعالية"}
                  </span>
                  {event.images?.length > 1 && (
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
                      {event.images.length} صورة
                    </span>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      bottom: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 10px",
                      borderRadius: 9,
                      background: "rgba(15,23,42,0.78)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <CalendarDays size={14} /> {formatDate(event.startDate)}
                  </div>
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
                      margin: "0 0 12px",
                      lineHeight: 1.3,
                    }}
                  >
                    {event.name || "فعالية بلا اسم"}
                  </h3>

                  <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      <CalendarDays size={15} color="#8b5cf6" />
                      <span>
                        {formatDate(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate
                          ? ` - ${formatDate(event.endDate)}`
                          : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      <Clock3 size={15} color="#8b5cf6" />
                      <span>{event.time || "سيتم إعلان الوقت لاحقًا"}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      <MapPin size={15} color="#8b5cf6" />
                      <span>{event.location || "لم يتم تحديد الموقع"}</span>
                    </div>
                  </div>

                  {event.price !== undefined && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#f7f3ff",
                        color: "#6d28d9",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <Ticket size={15} /> رسوم الدخول
                      </span>
                      <span>
                        {Number(event.price) === 0
                          ? "الدخول مجاني"
                          : `${event.price} $`}
                      </span>
                    </div>
                  )}

                  {event.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        margin: "14px 0 0",
                        lineHeight: 1.55,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 40,
                      }}
                    >
                      {event.description}
                    </p>
                  )}

                  {role === "admin" && (
                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: 18,
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 10,
                      }}
                    >
                      <Link
                        to={`/edit-event/${id}`}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px",
                          borderRadius: 10,
                          border: "1px solid #ddd6fe",
                          background: "#f5f3ff",
                          color: "#6d28d9",
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
                        aria-label="حذف الفعالية"
                        title="حذف الفعالية"
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
                    </div>
                  )}
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
              حذف الفعالية؟
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                margin: "0 0 24px 0",
              }}
            >
              لا يمكن التراجع عن هذا الإجراء، وستُحذف الفعالية نهائيًا.
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
                onClick={() => deleteEvent(deleteConfirm)}
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
