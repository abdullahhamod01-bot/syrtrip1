import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

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

export default function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    type: "SEDAN",
    color: "",
    pricePerDay: "",
    images: [],
    isAvailable: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCar = async () => {
      try {
        const res = await API.get(`/cars/${id}`);
        const car = res.data?.car || res.data;
        setForm({
          name: car.name || "",
          type: car.type || "SEDAN",
          color: car.color || "",
          pricePerDay: car.pricePerDay ?? "",
          images: Array.isArray(car.images) ? car.images : [],
          isAvailable: car.isAvailable !== false,
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "تعذر تحميل بيانات السيارة.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadCar();
  }, [id]);

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await API.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.url || res.data?.imageUrl;
      if (url)
        setForm((current) => ({
          ...current,
          images: [...current.images, url],
        }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "فشل رفع الصورة.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await API.put(`/cars/${id}`, {
        name: form.name.trim(),
        type: form.type,
        color: form.color.trim(),
        pricePerDay: Number(form.pricePerDay),
        images: form.images,
        isAvailable: form.isAvailable,
      });
      navigate("/owner/listings");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "تعذر تحديث السيارة.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="owner-loading-state">جار تحميل بيانات السيارة...</div>
    );

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
        <h1>تعديل السيارة</h1>
        <p>حافظ على تحديث بيانات المركبة وحالتها.</p>
      </div>
      {error && <div className="owner-error-banner">{error}</div>}
      <form className="owner-form-card" onSubmit={submit}>
        <div className="owner-form-grid">
          <label>
            اسم السيارة
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
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
            />
          </label>
          <label>
            السعر اليومي
            <input
              required
              type="number"
              min="0"
              value={form.pricePerDay}
              onChange={(event) =>
                setForm({ ...form, pricePerDay: event.target.value })
              }
            />
          </label>
        </div>
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
        <button className="owner-primary-button" disabled={saving || uploading}>
          <Save size={15} />
          {saving ? "جار الحفظ..." : "حفظ التغييرات"}
        </button>
      </form>
    </div>
  );
}
