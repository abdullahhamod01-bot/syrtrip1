import express from "express";
import { register, login, updateUserName } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/update-name", protect, updateUserName);

export default router;