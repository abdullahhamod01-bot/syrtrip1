import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// ✅ تسجيل مستخدم جديد
export const register = async (req, res) => {
  try {
    const { name = "مستخدم", email, password } = req.body;

    // التحقق من الحقول المطلوبة
    if (!email || !password) {
      return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبة" });
    }

    // التحقق من وجود المستخدم مسبقًا
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
    }

    // تشفير كلمة المرور
    const hashed = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = await User.create({ name, email, password: hashed });

    // إخفاء كلمة المرور من الرد
    const { password: _, ...userData } = user.toObject();

    res.status(201).json({
      message: "تم إنشاء المستخدم بنجاح",
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};

// ✅ تسجيل الدخول
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من الحقول المطلوبة
    if (!email || !password) {
      return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبة" });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // التحقق من كلمة المرور
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
    }

    // إنشاء التوكن
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // إخفاء كلمة المرور من الرد
    const { password: _, ...userData } = user.toObject();

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم: " + err.message });
  }
};

// ✅ تعديل اسم المستخدم
export const updateUserName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({ message: "❌ الاسم غير صالح" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "❌ المستخدم غير موجود" });
    }

    user.name = name;
    await user.save();

    res.status(200).json({ message: "✅ تم تعديل الاسم بنجاح", name: user.name });
  } catch (err) {
    res.status(500).json({ message: "❌ خطأ في الخادم: " + err.message });
  }
};
