import mongoose from "mongoose";

const transportSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String },
    images: [{ type: String }], // ✅ مصفوفة صور
    rating: { type: Number, default: 0 },
    description: { type: String },
    type: { type: String },
    fare: { type: Number, default: 0 },
    phoneNumber: { type: String }, // اختياري
  },
  { timestamps: true }
);

export default mongoose.model("Transport", transportSchema);
