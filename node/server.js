import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import placesRoutes from "./routes/placesRoutes.js";
import hotelsRoutes from "./routes/hotelsRoutes.js";
import restaurantsRoutes from "./routes/restaurantsRoutes.js";
import transportRoutes from "./routes/transportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { networkInterfaces } from "os";

// إعدادات البيئة والاتصال بقاعدة البيانات
dotenv.config();
connectDB();

const app = express();

// ✅ CORS محدد للـ Frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://your-frontend-url.onrender.com', // غيّر هذا لرابط Frontend على Render
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// المسارات (Routes)
app.use("/api/auth", authRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/hotels", hotelsRoutes);
app.use("/api/restaurants", restaurantsRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/admin", adminRoutes);

// وظيفة جلب عنوان IP المحلي
const getLocalIP = () => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if ((net.family === "IPv4" || net.family === 4) && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
};

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
const HOST = getLocalIP();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on: http://${HOST}:${PORT}`);
});