import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // معرف مخصص لتوافق مع تطبيق Flutter
    name: { type: String, required: true },
    location: { type: String },
    images: [{ type: String }], // ✅ مصفوفة صور
    rating: { type: Number, default: 0 },
    description: { type: String },
    category: { type: String }, // "hotel", "restaurant", "attraction", "transport"
  },
  { timestamps: true }
);

export default mongoose.model("Place", placeSchema);
