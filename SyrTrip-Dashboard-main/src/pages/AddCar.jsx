import { useEffect, useState } from "react";
import { ArrowLeft, CarFront, ImagePlus, Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

const carTypes = [
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "CONVERTIBLE",
  "COUPE",
  "MINIVAN",
  "PICKUP_TRUCK",
  "STATION_WAGON",
];

export default function AddCar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offices, setOffices] = useState([]);
  const [officeId, setOfficeId] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "SEDAN",
    color: "",
    pricePerDay: "",
    images: [],
    isAvailable: true,
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;

  useEffect(() => {
    const loadOffices = async () => {
      try {
        const res = await API.get("/offices", {
          params: { page: 1, limit: 100 },
        });
        const allOffices = Array.isArray(res.data)
          ? res.data
          : res.data?.offices || [];
        const owned = userId
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
        setOffices(owned);
        setOfficeId(owned[0]?.id || owned[0]?._id || "");
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "تعذر تحميل مكتب السيارات الخاص بك.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadOffices();
  }, [userId]);

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await API.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.url || res.data?.imageUrl;
      if (!url) throw new Error("لم يتم إرجاع رابط الصورة");
      setForm((current) => ({ ...current, images: [...current.images, url] }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "فشل رفع الصورة.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!officeId || !form.name.trim() || !form.pricePerDay) {
      setError("اختر مكتبًا وأكمل اسم السيارة والسعر اليومي.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await API.post(`/cars/${officeId}`, {
        name: form.name.trim(),
        type: form.type,
        color: form.color.trim(),
        pricePerDay: Number(form.pricePerDay),
        images: form.images,
        isAvailable: form.isAvailable,
        lat: form.latitude ? Number(form.latitude) : undefined,
        lng: form.longitude ? Number(form.longitude) : undefined,
      });
      navigate("/owner/listings");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "تعذر إضافة السيارة.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="owner-loading-state">جار تحميل مكتبك...</div>;

  return (
    <div className="owner-form-page">
      <button
        className="owner-ghost-button"
        onClick={() => navigate("/owner/listings")}
      >
        <ArrowLeft size={15} /> العودة إلى السيارات
      </button>
      <div className="owner-form-heading">
        <p className="owner-section-eyebrow">مخزون الأسطول</p>
        <h1>إضافة سيارة</h1>
        <p>أضف مركبة إلى مكتبك مع حالتها الحالية وسعرها اليومي.</p>
      </div>
      {error && <div className="owner-error-banner">{error}</div>}
      {offices.length === 0 ? (
        <div className="owner-empty-state owner-surface">
          <CarFront size={40} color="#9db3c5" />
          <h3>لم يتم العثور على مكتب</h3>
          <p>يحتاج حسابك إلى مكتب سيارات قبل إضافة المركبات.</p>
        </div>
      ) : (
        <form className="owner-form-card" onSubmit={submit}>
          <label>
            المكتب
            <select
              value={officeId}
              onChange={(event) => setOfficeId(event.target.value)}
            >
              {offices.map((office) => (
                <option
                  key={office.id || office._id}
                  value={office.id || office._id}
                >
                  {office.name}
                </option>
              ))}
            </select>
          </label>
          <div className="owner-form-grid">
            <label>
              اسم السيارة
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="كيا ريو"
              />
            </label>
            <label>
              النوع
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value })
                }
              >
                {carTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              اللون
              <input
                value={form.color}
                onChange={(event) =>
                  setForm({ ...form, color: event.target.value })
                }
                placeholder="أسود"
              />
            </label>
            <label>
              السعر اليومي
              <input
                type="number"
                min="0"
                value={form.pricePerDay}
                onChange={(event) =>
                  setForm({ ...form, pricePerDay: event.target.value })
                }
                placeholder="10"
              />
            </label>
            <label>
              خط العرض
              <input
                type="number"
                step="0.000001"
                value={form.latitude}
                onChange={(event) =>
                  setForm({ ...form, latitude: event.target.value })
                }
                placeholder="33.5138"
              />
            </label>
            <label>
              خط الطول
              <input
                type="number"
                step="0.000001"
                value={form.longitude}
                onChange={(event) =>
                  setForm({ ...form, longitude: event.target.value })
                }
                placeholder="36.2765"
              />
            </label>
          </div>
          <LocationPicker
            lat={form.latitude}
            lng={form.longitude}
            onChange={({ latitude, longitude }) =>
              setForm((prev) => ({
                ...prev,
                latitude: String(latitude),
                longitude: String(longitude),
              }))
            }
          />
          <label className="owner-checkbox">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) =>
                setForm({ ...form, isAvailable: event.target.checked })
              }
            />{" "}
            متاح للحجز
          </label>
          <label className="owner-upload">
            <ImagePlus size={18} /> إضافة صورة السيارة
            <input
              type="file"
              accept="image/*"
              onChange={(event) => uploadImage(event.target.files?.[0])}
              disabled={uploading}
            />
            {uploading && <Loader2 size={15} className="owner-spin" />}
          </label>
          {form.images.length > 0 && (
            <div className="owner-image-preview">
              {form.images.map((image) => (
                <img key={image} src={image} alt="معاينة السيارة" />
              ))}
            </div>
          )}
          <button
            className="owner-primary-button"
            disabled={saving || uploading}
          >
            <Save size={15} />
            {saving ? "جار الحفظ..." : "حفظ السيارة"}
          </button>
        </form>
      )}
    </div>
  );
}
