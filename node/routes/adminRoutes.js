import express from "express";
import {
  loginAdmin,
  getAdminDashboard,
  createAdmin,
  updateAdmin,
  getAllAdmins,
  deleteAdmin,
  changePassword,
} from "../controllers/adminController.js";
import {
  adminAuth,
  superAdminOnly,
} from "../middleware/adminMiddleware.js";

const router = express.Router();

// 🔓 المسارات العامة
router.post("/login", loginAdmin);

// 🔐 المسارات المحمية
router.get("/dashboard", adminAuth, getAdminDashboard);
router.post("/change-password", adminAuth, changePassword);

// 👑 مسارات المدير العام فقط
router.post("/create", adminAuth, superAdminOnly, createAdmin);
router.get("/all", adminAuth, superAdminOnly, getAllAdmins);
router.put("/:id", adminAuth, superAdminOnly, updateAdmin);
router.delete("/:id", adminAuth, superAdminOnly, deleteAdmin);

export default router;
