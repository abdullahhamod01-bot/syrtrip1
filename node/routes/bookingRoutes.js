import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getConflictingBookings,
  getBookingStats,
} from "../controllers/bookingController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// جميع مسارات الحجز تتطلب مصادقة
router.use(authenticate);

// إنشاء حجز جديد
router.post("/", createBooking);

// الحصول على جميع حجوزات المستخدم
router.get("/", getUserBookings);

// الحصول على إحصائيات الحجوزات
router.get("/stats/all", getBookingStats);

// الحصول على الحجوزات المتعارضة
router.get("/conflicts/check", getConflictingBookings);

// الحصول على حجز محدد
router.get("/:bookingId", getBookingById);

// تعديل حجز
router.put("/:bookingId", updateBooking);

// إلغاء حجز
router.delete("/:bookingId", cancelBooking);

export default router;
