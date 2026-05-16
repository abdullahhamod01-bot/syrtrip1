import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";

// إنشاء حجز جديد
export const createBooking = async (req, res) => {
  try {
    const {
      itemId,
      itemType,
      itemName,
      location,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      notes,
      contactPerson,
      phoneNumber,
      roomNumber,
      tableNumber,
    } = req.body;

    const userId = req.user.id;

    // التحقق من أن تاريخ الخروج أكبر من تاريخ الدخول
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(400).json({
        message: "تاريخ الخروج يجب أن يكون بعد تاريخ الدخول",
      });
    }

    // التحقق من عدم وجود حجز متعارض
    const conflictingBooking = await Booking.findOne({
      itemId,
      itemType,
      status: { $ne: "cancelled" },
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: "تعارض في المواعيد! هناك حجز آخر في هذا الوقت",
        conflictingBooking,
      });
    }

    const newBooking = new Booking({
      userId,
      itemId,
      itemType,
      itemName,
      location,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      numberOfGuests,
      totalPrice,
      notes,
      contactPerson,
      phoneNumber,
      roomNumber,
      tableNumber,
      status: "confirmed",
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      message: "تم إنشاء الحجز بنجاح",
      booking: savedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: "خطأ في إنشاء الحجز",
      error: error.message,
    });
  }
};

// الحصول على جميع حجوزات المستخدم
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType, status } = req.query;

    const filter = { userId };

    if (itemType) filter.itemType = itemType;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter).sort({ checkInDate: -1 });

    res.status(200).json({
      message: "تم جلب الحجوزات بنجاح",
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "خطأ في جلب الحجوزات",
      error: error.message,
    });
  }
};

// الحصول على حجز واحد
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("userId");

    if (!booking) {
      return res.status(404).json({
        message: "الحجز غير موجود",
      });
    }

    res.status(200).json({
      message: "تم جلب الحجز بنجاح",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "خطأ في جلب الحجز",
      error: error.message,
    });
  }
};

// تعديل حجز
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const {
      checkInDate,
      checkOutDate,
      numberOfGuests,
      notes,
      contactPerson,
      phoneNumber,
    } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "الحجز غير موجود",
      });
    }

    // التحقق من أن المستخدم هو مالك الحجز
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        message: "غير مصرح لتعديل هذا الحجز",
      });
    }

    // إذا تم تغيير المواعيد، تحقق من التعارض
    if (checkInDate || checkOutDate) {
      const newCheckIn = checkInDate ? new Date(checkInDate) : booking.checkInDate;
      const newCheckOut = checkOutDate ? new Date(checkOutDate) : booking.checkOutDate;

      if (newCheckOut <= newCheckIn) {
        return res.status(400).json({
          message: "تاريخ الخروج يجب أن يكون بعد تاريخ الدخول",
        });
      }

      const conflictingBooking = await Booking.findOne({
        _id: { $ne: bookingId },
        itemId: booking.itemId,
        itemType: booking.itemType,
        status: { $ne: "cancelled" },
        $or: [
          {
            checkInDate: { $lt: newCheckOut },
            checkOutDate: { $gt: newCheckIn },
          },
        ],
      });

      if (conflictingBooking) {
        return res.status(409).json({
          message: "تعارض في المواعيد! هناك حجز آخر في هذا الوقت",
        });
      }

      booking.checkInDate = newCheckIn;
      booking.checkOutDate = newCheckOut;
    }

    if (numberOfGuests) booking.numberOfGuests = numberOfGuests;
    if (notes !== undefined) booking.notes = notes;
    if (contactPerson) booking.contactPerson = contactPerson;
    if (phoneNumber) booking.phoneNumber = phoneNumber;

    const updatedBooking = await booking.save();

    res.status(200).json({
      message: "تم تحديث الحجز بنجاح",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: "خطأ في تحديث الحجز",
      error: error.message,
    });
  }
};

// إلغاء حجز
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "الحجز غير موجود",
      });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        message: "غير مصرح لإلغاء هذا الحجز",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      message: "تم إلغاء الحجز بنجاح",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "خطأ في إلغاء الحجز",
      error: error.message,
    });
  }
};

// الحصول على الحجوزات المتعارضة لعنصر معين
export const getConflictingBookings = async (req, res) => {
  try {
    const { itemId, itemType, checkInDate, checkOutDate } = req.query;

    if (!itemId || !itemType || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "يجب توفير itemId, itemType, checkInDate, checkOutDate",
      });
    }

    const conflictingBookings = await Booking.find({
      itemId,
      itemType,
      status: { $ne: "cancelled" },
      $or: [
        {
          checkInDate: { $lt: new Date(checkOutDate) },
          checkOutDate: { $gt: new Date(checkInDate) },
        },
      ],
    });

    res.status(200).json({
      message: "تم جلب الحجوزات المتعارضة",
      conflictingBookings,
      count: conflictingBookings.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "خطأ في جلب الحجوزات المتعارضة",
      error: error.message,
    });
  }
};

// الحصول على إحصائيات الحجوزات
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Booking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$itemType",
          count: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
          avgPrice: { $avg: "$totalPrice" },
        },
      },
    ]);

    const allBookingsCount = await Booking.countDocuments({ userId });
    const pendingCount = await Booking.countDocuments({
      userId,
      status: "pending",
    });
    const confirmedCount = await Booking.countDocuments({
      userId,
      status: "confirmed",
    });
    const cancelledCount = await Booking.countDocuments({
      userId,
      status: "cancelled",
    });

    res.status(200).json({
      message: "تم جلب الإحصائيات بنجاح",
      stats: {
        byType: stats,
        total: allBookingsCount,
        pending: pendingCount,
        confirmed: confirmedCount,
        cancelled: cancelledCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "خطأ في جلب الإحصائيات",
      error: error.message,
    });
  }
};
