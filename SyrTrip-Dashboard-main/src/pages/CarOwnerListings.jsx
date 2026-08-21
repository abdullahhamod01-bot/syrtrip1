import { useEffect, useState } from "react";
import {
  CarFront,
  Edit3,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";

export default function CarOwnerListings() {
  const { user } = useAuth();
  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;
  const [offices, setOffices] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFleet = async () => {
    setLoading(true);
    setError("");
    try {
      const [officesRes, carsRes] = await Promise.all([
        API.get("/offices", { params: { page: 1, limit: 100 } }),
        API.get("/cars", { params: { page: 1, limit: 100 } }),
      ]);
      const allOffices = Array.isArray(officesRes.data)
        ? officesRes.data
        : officesRes.data?.offices || [];
      const ownedOffices = userId
        ? allOffices.filter(
            (office) =>
              String(
                office.ownerId ||
                  office.owner?.id ||
                  office.owner?._id ||
                  office.owner,
              ) === String(userId),
          )
        : allOffices;
      const officeIds = new Set(
        ownedOffices.map((office) => String(office.id || office._id)),
      );
      const allCars = Array.isArray(carsRes.data)
        ? carsRes.data
        : carsRes.data?.cars || [];
      setOffices(ownedOffices);
      setCars(
        userId
          ? allCars.filter((car) =>
              officeIds.has(
                String(car.officeId || car.office?.id || car.office?._id),
              ),
            )
          : allCars,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "تعذر تحميل أسطول سياراتك.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, [userId]);

  const deleteCar = async (id) => {
    if (!window.confirm("هل تريد إزالة هذه السيارة من أسطولك؟")) return;
    try {
      await API.delete(`/cars/${id}`);
      await loadFleet();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "تعذر إزالة السيارة.");
    }
  };

  if (loading)
    return (
      <OwnerLayout>
        <div className="owner-loading-state">جار تحميل أسطولك...</div>
      </OwnerLayout>
    );

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
            <p className="owner-section-eyebrow">إدارة الأسطول</p>
            <h1 style={{ fontSize: 32, color: "#111827", margin: "0 0 8px" }}>
              سياراتي
            </h1>
            <p style={{ color: "#6b7280", margin: 0 }}>
              إدارة المركبات والأسعار والتوافر وبيانات المكتب.
            </p>
          </div>
          <div className="owner-page-actions">
            <Link to="/owner/listings/new/car" className="owner-primary-button">
              <Plus size={15} /> إضافة سيارة
            </Link>
            <button className="owner-ghost-button" onClick={loadFleet}>
              <RefreshCw size={15} /> تحديث
            </button>
          </div>
        </div>
        {error && <div className="owner-error-banner">{error}</div>}
        <section className="owner-surface owner-office-banner">
          <div>
            <p className="owner-section-eyebrow">مكتبك</p>
            <h2>{offices[0]?.name || "لم يتم العثور على مكتب"}</h2>
            <p>
              <MapPin size={14} />
              {offices[0]?.location || "لم يتم تحديد الموقع"}{" "}
              <Phone size={14} />
              {offices[0]?.phone || "لم يتم إضافة رقم هاتف"}
            </p>
          </div>
          {offices[0] && (
            <Link
              className="owner-edit-link"
              to={`/owner/office/edit/${offices[0].id || offices[0]._id}`}
            >
              <Edit3 size={14} /> تعديل المكتب
            </Link>
          )}
        </section>
        {cars.length === 0 ? (
          <div className="owner-empty-state owner-surface">
            <CarFront size={42} color="#9db3c5" />
            <h3>لا توجد سيارات في أسطولك</h3>
            <p>أضف مركبة لبدء استقبال حجوزات التأجير.</p>
            <Link to="/owner/listings/new/car" className="owner-primary-button">
              إضافة سيارة
            </Link>
          </div>
        ) : (
          <div
            className="owner-listings-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 20,
            }}
          >
            {cars.map((car) => {
              const id = car.id || car._id;
              return (
                <article
                  className="owner-listing-card"
                  key={id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    className="owner-listing-image"
                    style={{
                      height: 180,
                      background: car.images?.[0]
                        ? `url(${car.images[0]}) center/cover`
                        : "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {!car.images?.[0] && <CarFront size={42} color="#818cf8" />}
                  </div>
                  <div style={{ padding: 18 }}>
                    <h3 style={{ margin: "0 0 8px", color: "#111827" }}>
                      {car.name || "سيارة بلا اسم"}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "#6b7280",
                        fontSize: 13,
                      }}
                    >
                      {car.color || "لم يُحدد اللون"}
                    </p>
                    <p
                      style={{
                        margin: "0 0 16px",
                        color: "#111827",
                        fontWeight: 700,
                      }}
                    >
                      ${car.pricePerDay ?? 0}{" "}
                      <span
                        style={{
                          color: "#6b7280",
                          fontWeight: 400,
                          fontSize: 12,
                        }}
                      >
                        / يوم
                      </span>
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        className="owner-edit-link"
                        to={`/owner/listings/edit/car/${id}`}
                      >
                        <Edit3 size={14} /> تعديل
                      </Link>
                      <button
                        className="owner-delete-button"
                        onClick={() => deleteCar(id)}
                      >
                        <Trash2 size={14} /> حذف
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
