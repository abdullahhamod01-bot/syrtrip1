import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "hotel_manager", "restaurant_manager"],
      required: true,
      default: "hotel_manager",
    },
    // للمديرين الخاصين
    managedHotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
    managedRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
    
    // معلومات إضافية
    phone: String,
    avatar: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
