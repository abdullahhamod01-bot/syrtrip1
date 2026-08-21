import { useEffect, useState } from "react";
import {
  CarFront,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";

export default function CarOwnerDashboard() {
  const { user } = useAuth();
  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;
  const [office, setOffice] = useState(null);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [officesRes, carsRes, bookingsRes] = await Promise.all([
        API.get("/offices", { params: { page: 1, limit: 100 } }),
        API.get("/cars", { params: { page: 1, limit: 100 } }),
        API.get("/bookings/owner-bookings"),
      ]);
      const allOffices = Array.isArray(officesRes.data)
        ? officesRes.data
        : officesRes.data?.offices || [];
      const ownedOffices = userId
        ? allOffices.filter(
            (item) =>
              String(
                item.ownerId || item.owner?.id || item.owner?._id || item.owner,
              ) === String(userId),
          )
        : allOffices;
      const currentOffice = ownedOffices[0];
      const officeIds = new Set(
        ownedOffices.map((item) => String(item.id || item._id)),
      );
      const allCars = Array.isArray(carsRes.data)
        ? carsRes.data
        : carsRes.data?.cars || [];
      const ownerBookings = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data?.bookings || [];
      setOffice(currentOffice || null);
      setCars(
        userId
          ? allCars.filter((car) =>
              officeIds.has(
                String(car.officeId || car.office?.id || car.office?._id),
              ),
            )
          : allCars,
      );
      setBookings(ownerBookings);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر تحميل لوحة تحكم تأجير السيارات.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [userId]);
  if (loading)
    return (
      <OwnerLayout>
        <div className="owner-loading-state">تحميل البيانات...</div>
      </OwnerLayout>
    );
  const pending = bookings.filter((item) => item.status === "PENDING").length;
  const approved = bookings.filter((item) => item.status === "APPROVED").length;

  return (
    <OwnerLayout>
      <div
        className="owner-page owner-dashboard-page"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
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
            <p className="owner-section-eyebrow">عمليات تأجير السيارات</p>
          </div>
          <button className="owner-ghost-button" onClick={loadDashboard}>
            <RefreshCw size={15} /> إعادة التحميل
          </button>
        </div>
        {error && <div className="owner-error-banner">{error}</div>}
        <div
          className="owner-stat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "سيارات الأسطول",
              value: cars.length,
              icon: CarFront,
              color: "#2e5f87",
            },
            {
              label: "الحجوزات",
              value: bookings.length,
              icon: CalendarDays,
              color: "#42658a",
            },
            { label: "معلقة", value: pending, icon: Clock3, color: "#b7791f" },
            {
              label: "مقبولة",
              value: approved,
              icon: CheckCircle2,
              color: "#237a58",
            },
          ].map((stat) => (
            <div
              className="owner-stat-card"
              key={stat.label}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #f3f4f6",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div className="owner-stat-icon" style={{ color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <strong
                style={{
                  display: "block",
                  marginTop: 15,
                  fontSize: 28,
                  color: stat.color,
                }}
              >
                {stat.value}
              </strong>
              <span style={{ color: "#6b7280", fontSize: 13 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        <section className="owner-surface owner-office-banner">
          <div>
            <p className="owner-section-eyebrow">مكتب السيارات</p>
            <h2>{office?.name || "لم يتم العثور على مكتب سيارات"}</h2>
            <p>
              <MapPin size={14} />
              {office?.location || "لم يتم تحديد الموقع"}
            </p>
          </div>
          {office && (
            <Link
              className="owner-edit-link"
              to={`/owner/office/edit/${office.id || office._id}`}
            >
              <Edit3 size={14} /> تعديل المكتب
            </Link>
          )}
        </section>
      </div>
    </OwnerLayout>
  );
}
