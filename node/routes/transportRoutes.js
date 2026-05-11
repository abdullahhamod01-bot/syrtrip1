
// routes/transportRoutes.js
import express from "express";
import {
  getTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport,
} from "../controllers/transportController.js";

const router = express.Router();

router.get("/", getTransports);
router.get("/:id", getTransportById);
router.post("/", createTransport);
router.put("/:id", updateTransport);
router.delete("/:id", deleteTransport);

export default router;

