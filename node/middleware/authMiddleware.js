import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// حماية الراوتات
export const protect = async (req, res, next) => {
  try {
    // استخراج التوكن من الهيدر
    const token = req.headers.authorization?.split(" ")[1];

    // التحقق من وجود التوكن
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "❌ غير مصرح، لا يوجد توكن",
      });
    }

    // فك تشفير التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // جلب المستخدم بدون كلمة المرور
    req.user = await User.findById(decoded.id).select("-password");

    // التحقق من وجود المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "❌ المستخدم غير موجود",
      });
    }

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);

    return res.status(401).json({
      success: false,
      message: "❌ توكن غير صالح",
    });
  }
};

// اسم إضافي لتجنب أخطاء الاستيراد
export const authenticate = protect;