import { useEffect, useState } from "react";
import API from "../api/api";
import OwnerLayout from "../layouts/OwnerLayout";

const statusColors = {
  PENDING: { bg: "#fef3c7", text: "#92400e", label: "معلق" },
  APPROVED: { bg: "#dcfce7", text: "#166534", label: "مقبول" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b", label: "مرفوض" },
};

export default function OwnerBookings() {
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actingOnBooking, setActingOnBooking] = useState(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/bookings/owner-bookings";
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      const res = await API.get(url);
      const bookingsData = Array.isArray(res.data)
        ? res.data
        : res.data?.bookings || [];
      setFilteredBookings(bookingsData);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setError(error.response?.data?.message || "تعذر تحميل طلبات الحجز.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setActingOnBooking(bookingId);
      await API.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      await loadBookings();
      setActionMessage(
        `تم ${newStatus === "APPROVED" ? "قبول" : "رفض"} الحجز بنجاح.`,
      );
      setActingOnBooking(null);
    } catch (error) {
      console.error("Error updating booking status:", error);
      setError(error.response?.data?.message || "تعذر تحديث حالة الحجز.");
      setActingOnBooking(null);
    }
  };

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
          <p style={{ color: "#6b7280" }}>جار تحميل الحجوزات...</p>
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
              الحجوزات
            </h1>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
              إدارة طلبات الحجز والرد عليها
            </p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <option value="">كل الحالات</option>
            <option value="PENDING">معلق</option>
            <option value="APPROVED">مقبول</option>
            <option value="REJECTED">مرفوض</option>
          </select>
        </div>

        {actionMessage && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              color: "#166534",
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {actionMessage}
          </div>
        )}
        {error && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#f9fafb",
              borderRadius: 16,
              border: "1px dashed #e5e7eb",
            }}
          >
            <p style={{ color: "#9ca3af", fontSize: 14 }}>لا توجد حجوزات</p>
          </div>
        ) : (
          <div
            className="owner-bookings-list"
            style={{ display: "grid", gap: 16 }}
          >
            {filteredBookings.map((booking) => {
              const statusInfo =
                statusColors[booking.status] || statusColors.PENDING;
              return (
                <div
                  className="owner-booking-card"
                  key={booking.id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 20,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 12,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {booking.hotel?.name ||
                            booking.car?.brand ||
                            booking.restaurant?.name ||
                            "حجز"}
                        </h3>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 20,
                            background: statusInfo.bg,
                            color: statusInfo.text,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div
                        className="owner-booking-details"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                          marginBottom: 16,
                          fontSize: 13,
                          color: "#6b7280",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#111827" }}>العميل:</strong>{" "}
                          {booking.customer?.name}
                          <br />
                          <strong style={{ color: "#111827" }}>
                            البريد الإلكتروني:
                          </strong>{" "}
                          {booking.customer?.email}
                          <br />
                          <strong style={{ color: "#111827" }}>
                            الهاتف:
                          </strong>{" "}
                          {booking.customer?.phone}
                        </div>
                        <div>
                          <strong style={{ color: "#111827" }}>
                            تسجيل الوصول:
                          </strong>{" "}
                          {new Date(booking.startDate).toLocaleDateString(
                            "ar-SY",
                          )}
                          <br />
                          <strong style={{ color: "#111827" }}>
                            تسجيل المغادرة:
                          </strong>{" "}
                          {new Date(booking.endDate).toLocaleDateString(
                            "ar-SY",
                          )}
                          <br />
                          <strong style={{ color: "#111827" }}>
                            السعر الإجمالي:
                          </strong>{" "}
                          ${booking.totalPrice}
                        </div>
                      </div>
                    </div>

                    {booking.status === "PENDING" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleUpdateStatus(booking.id, "APPROVED")
                          }
                          disabled={actingOnBooking === booking.id}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: "#10b981",
                            color: "#fff",
                            cursor:
                              actingOnBooking === booking.id
                                ? "not-allowed"
                                : "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.background = "#059669")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background = "#10b981")
                          }
                        >
                          قبول
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(booking.id, "REJECTED")
                          }
                          disabled={actingOnBooking === booking.id}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: "#ef4444",
                            color: "#fff",
                            cursor:
                              actingOnBooking === booking.id
                                ? "not-allowed"
                                : "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.background = "#dc2626")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background = "#ef4444")
                          }
                        >
                          رفض
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
