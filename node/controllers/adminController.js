import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Hotel from "../models/hotelModel.js";
import Restaurant from "../models/restaurantModel.js";

// 🔐 تسجيل دخول الإداري
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "البريد والرمز مطلوبان" });
    }

    const admin = await Admin.findOne({ email })
      .populate("managedHotels")
      .populate("managedRestaurants");

    if (!admin) {
      return res.status(404).json({ message: "الإداري غير موجود" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "الحساب غير مفعل" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
    }

    // تحديث آخر دخول
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const { password: _, ...adminData } = admin.toObject();

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      admin: adminData,
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};

// 📊 الحصول على إحصائيات الإداري
export const getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId)
      .populate("managedHotels")
      .populate("managedRestaurants");

    let stats = {
      hotels: 0,
      restaurants: 0,
      totalBookings: 0,
      totalRevenue: 0,
    };

    if (admin.role === "super_admin") {
      const hotelCount = await Hotel.countDocuments();
      const restaurantCount = await Restaurant.countDocuments();
      stats = { hotels: hotelCount, restaurants: restaurantCount };
    } else if (admin.role === "hotel_manager") {
      stats.hotels = admin.managedHotels.length;
    } else if (admin.role === "restaurant_manager") {
      stats.restaurants = admin.managedRestaurants.length;
    }

    res.json({ admin, stats });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};

// 👥 إنشاء إداري جديد (فقط super_admin)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, managedHotels, managedRestaurants } =
      req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "البريد مستخدم بالفعل" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashed,
      role,
      managedHotels: managedHotels || [],
      managedRestaurants: managedRestaurants || [],
    });

    const { password: _, ...adminData } = admin.toObject();

    res.status(201).json({
      message: "تم إنشاء الإداري بنجاح",
      admin: adminData,
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};

// 📝 تحديث بيانات الإداري
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, avatar, managedHotels, managedRestaurants } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        avatar,
        managedHotels: managedHotels || undefined,
        managedRestaurants: managedRestaurants || undefined,
      },
      { new: true }
    );

    res.json({
      message: "تم تحديث البيانات بنجاح",
      admin,
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};

// 📋 الحصول على جميع الإداريين
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .populate("managedHotels")
      .populate("managedRestaurants");

    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};

// ❌ حذف إداري
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await Admin.findByIdAndDelete(id);

    res.json({ message: "تم حذف الإداري بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};

// 🔄 تغيير كلمة المرور
export const changePassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(adminId);

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};
