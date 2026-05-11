import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // معرف مخصص لتوافق مع تطبيق Flutter
    name: { type: String, required: true },
    location: { type: String },
    images: [{ type: String }], // ✅ مصفوفة صور
    rating: { type: Number, default: 0 },
    description: { type: String },
    pricePerNight: { type: Number, default: 0 },
    phoneNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);
