import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw, Star } from "lucide-react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../layouts/OwnerLayout";

function getId(item) {
  return item?.id || item?._id;
}

function extractList(data, key) {
  if (Array.isArray(data)) return data;
  return data?.[key] || data?.reviews || [];
}

export default function OwnerReviews() {
  const { user } = useAuth();
  const role = (
    user?.role ||
    user?.user?.role ||
    user?.roles?.[0]
  )?.toLowerCase();
  const userId =
    user?.id || user?._id || user?.user?.id || user?.user?._id || user?.userId;
  const isCarOwner = role === "car_rental_owner" || role === "car_owner";
  const itemType =
    role === "restaurant_owner" ? "RESTAURANT" : isCarOwner ? "CAR" : "HOTEL";
  const collectionPath =
    role === "restaurant_owner"
      ? "/restaurants"
      : isCarOwner
        ? "/cars"
        : "/hotels";
  const collectionKey =
    role === "restaurant_owner"
      ? "restaurants"
      : isCarOwner
        ? "cars"
        : "hotels";
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get(collectionPath, {
        params: { page: 1, limit: 100 },
      });
      const allListings = extractList(response.data, collectionKey);
      let ownedListings = allListings;
      if (isCarOwner) {
        const officesResponse = await API.get("/offices", {
          params: { page: 1, limit: 100 },
        });
        const offices = extractList(officesResponse.data, "offices");
        const officeIds = new Set(
          offices
            .filter(
              (office) =>
                String(
                  office.ownerId ||
                    office.owner?.id ||
                    office.owner?._id ||
                    office.owner,
                ) === String(userId),
            )
            .map((office) => String(getId(office))),
        );
        ownedListings = userId
          ? allListings.filter((item) =>
              officeIds.has(
                String(item.officeId || item.office?.id || item.office?._id),
              ),
            )
          : allListings;
      } else {
        ownedListings = userId
          ? allListings.filter(
              (item) =>
                String(
                  item.ownerId ||
                    item.owner?.id ||
                    item.owner?._id ||
                    item.owner,
                ) === String(userId),
            )
          : allListings;
      }
      const reviewResults = await Promise.all(
        ownedListings.map(async (item) => {
          const itemId = getId(item);
          try {
            const reviewResponse = await API.get("/interactions/reviews", {
              params: { itemType, itemId },
            });
            return extractList(reviewResponse.data, "reviews").map(
              (review) => ({ ...review, itemName: item.name }),
            );
          } catch {
            return [];
          }
        }),
      );
      setListings(ownedListings);
      setReviews(reviewResults.flat());
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "تعذر تحميل تقييمات الضيوف.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [userId, itemType]);

  if (loading)
    return (
      <OwnerLayout>
        <div className="owner-loading-state">جار تحميل تقييمات الضيوف...</div>
      </OwnerLayout>
    );

  return (
    <OwnerLayout>
      <div className="owner-page" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          className="owner-page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <p className="owner-section-eyebrow">آراء الضيوف</p>
            <h1 style={{ fontSize: 32, margin: "0 0 8px", color: "#111827" }}>
              التقييمات
            </h1>
            <p style={{ color: "#6b7280", margin: 0 }}>
              اطلع على آراء الضيوف حول{" "}
              {itemType === "HOTEL" ? "فندقك" : "مطاعمك"}.
            </p>
          </div>
          <button className="owner-ghost-button" onClick={loadReviews}>
            <RefreshCw size={15} /> تحديث
          </button>
        </div>
        {error && <div className="owner-error-banner">{error}</div>}
        {reviews.length === 0 ? (
          <div className="owner-empty-state owner-surface">
            <MessageSquare size={40} color="#9db3c5" />
            <h3>لا توجد تقييمات بعد</h3>
            <p>ستظهر آراء الضيوف هنا بعد استلام أول تقييم.</p>
          </div>
        ) : (
          <div className="owner-review-list">
            {reviews.map((review, index) => (
              <article
                className="owner-review-card"
                key={review.id || review._id || `${review.itemName}-${index}`}
              >
                <div className="owner-review-header">
                  <div>
                    <strong>{review.itemName || "قائمتك"}</strong>
                    <span>
                      {review.user?.name || review.customer?.name || "ضيف"}
                    </span>
                  </div>
                  <div className="owner-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        fill={star <= (review.rating || 0) ? "#e7a83b" : "none"}
                        color="#e7a83b"
                      />
                    ))}
                  </div>
                </div>
                <p>
                  {review.comment ||
                    review.text ||
                    review.review ||
                    "لا يوجد تعليق مكتوب."}
                </p>
                <small>
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString("ar-SY")
                    : ""}
                </small>
              </article>
            ))}
          </div>
        )}
        {listings.length > 0 && (
          <p className="owner-review-footnote">
            يتم عرض آراء {listings.length}{" "}
            {listings.length === 1 ? "قائمة مملوكة" : "قوائم مملوكة"}.
          </p>
        )}
      </div>
    </OwnerLayout>
  );
}
