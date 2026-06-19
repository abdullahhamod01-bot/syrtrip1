import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "التوكن مطلوب" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "توكن غير صحيح أو منتهي الصلاحية" });
  }
};

export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "فقط المدير العام له الصلاحية" });
  }
  next();
};

export const hotelManagerOnly = (req, res, next) => {
  if (req.user.role !== "hotel_manager" && req.user.role !== "super_admin") {
    return res.status(403).json({ message: "فقط مدير الفنادق له الصلاحية" });
  }
  next();
};

export const restaurantManagerOnly = (req, res, next) => {
  if (req.user.role !== "restaurant_manager" && req.user.role !== "super_admin") {
    return res.status(403).json({ message: "فقط مدير المطاعم له الصلاحية" });
  }
  next();
};
