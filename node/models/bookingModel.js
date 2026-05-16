import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    itemType: {
      type: String,
      enum: ["hotel", "restaurant", "transport"],
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
    },
    roomNumber: {
      type: String,
      required: false,
    },
    tableNumber: {
      type: String,
      required: false,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      required: false,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// منع التعارض بين الحجوزات
bookingSchema.pre("save", async function (next) {
  if (this.isNew) {
    const existingBooking = await mongoose.model("Booking").findOne({
      itemId: this.itemId,
      itemType: this.itemType,
      status: { $ne: "cancelled" },
      $or: [
        {
          checkInDate: { $lt: this.checkOutDate },
          checkOutDate: { $gt: this.checkInDate },
        },
      ],
    });

    if (existingBooking) {
      throw new Error("تعارض في المواعيد! هناك حجز آخر في هذا الوقت");
    }
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
