import { useEffect, useState } from "react";
import API from "../api/api";
import {
  MapPin,
  Tag,
  Star,
  Trash2,
  Search,
  Filter,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Places() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/places");
      setData(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error("Error loading places:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let result = [...data];
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    result.sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
    setFilteredData(result);
  }, [searchQuery, sortBy, data]);

  const deletePlace = async (id) => {
    try {
      await API.delete(`/places/${id}`);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      console.error("Error deleting place:", err);
      alert("Failed to delete place");
    }
  };

  const categoryColors = {
    hotel: "#667eea",
    restaurant: "#f5576c",
    attraction: "#4facfe",
    transport: "#fa709a",
    default: "#9ca3af",
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
      {/* Header */}
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
            Places
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            Manage tourist places, attractions, and destinations
          </p>
        </div>
        <Link
          to="/add-place"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(245,87,108,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(245,87,108,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(245,87,108,0.3)";
          }}
        >
          <Plus size={18} />
          Add Place
        </Link>
      </div>

      {/* Search & Filter */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
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
            placeholder="Search places by name, location, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 44px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#f5576c";
              e.target.style.boxShadow = "0 0 0 3px rgba(245,87,108,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.boxShadow = "none";
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
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p
        style={{
          fontSize: 14,
          color: "#6b7280",
          marginBottom: 20,
        }}
      >
        Showing <strong style={{ color: "#111827" }}>{filteredData.length}</strong> of{" "}
        <strong style={{ color: "#111827" }}>{data.length}</strong> places
      </p>

      {/* Places Grid */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 340,
                borderRadius: 16,
                background: "#f3f4f6",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
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
            No places found
          </h3>
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
            {searchQuery
              ? "Try adjusting your search query"
              : "Start by adding your first place"}
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
          {filteredData.map((p) => {
            const catColor = categoryColors[p.category] || categoryColors.default;
            return (
              <div
                key={p._id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
                  border: "1px solid #f3f4f6",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)";
                }}
              >
                {/* Image */}
                <div
                  style={{
                    height: 180,
                    background: p.images?.[0]
                      ? `url(${p.images[0]}) center/cover`
                      : `linear-gradient(135deg, ${catColor}22 0%, ${catColor}44 100%)`,
                    position: "relative",
                  }}
                >
                  {!p.images?.[0] && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ImageIcon size={36} color={catColor} opacity={0.4} />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      padding: "6px 14px",
                      borderRadius: 20,
                      background: catColor,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Tag size={12} />
                    {p.category || "Uncategorized"}
                  </div>
                  {/* Rating Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      padding: "6px 12px",
                      borderRadius: 20,
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(8px)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Star size={12} fill="#fbbf24" color="#fbbf24" />
                    {p.rating || 0}
                  </div>
                </div>

                {/* Content */}
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
                    {p.name}
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
                      {p.location || "No location specified"}
                    </span>
                  </div>

                  {renderStars(p.rating)}

                  {p.description && (
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
                      {p.description}
                    </p>
                  )}

                  {/* Delete Button */}
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <button
                      onClick={() => setDeleteConfirm(p._id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "10px",
                        borderRadius: 10,
                        border: "1px solid #fee2e2",
                        background: "#fef2f2",
                        color: "#dc2626",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fee2e2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                    >
                      <Trash2 size={14} />
                      Delete Place
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              Delete Place?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                margin: "0 0 24px 0",
              }}
            >
              This action cannot be undone. The place will be permanently removed.
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
                Cancel
              </button>
              <button
                onClick={() => deletePlace(deleteConfirm)}
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}