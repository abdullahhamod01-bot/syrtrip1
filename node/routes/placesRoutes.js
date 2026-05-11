
// routes/placesRoutes.js
import express from "express";
import {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
} from "../controllers/placesController.js";

const router = express.Router();

router.get("/", getPlaces);
router.get("/:id", getPlaceById);
router.post("/", createPlace);
router.put("/:id", updatePlace);
router.delete("/:id", deletePlace);

export default router;