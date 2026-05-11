import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String },
    images: [{ type: String }], // ✅ مصفوفة صور
    rating: { type: Number, default: 0 },
    description: { type: String },
    cuisineType: { type: String },
    phoneNumber: { type: String }, // اختياري
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
