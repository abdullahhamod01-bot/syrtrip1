
// controllers/placesController.js
import Place from "../models/placeModel.js";

/**
 * Controller for generic "places" (all categories)
 */

export const getPlaces = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const places = await Place.find(filter).sort({ createdAt: -1 });
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPlace = async (req, res) => {
  try {
    const data = req.body;
    const place = await Place.create(data);
    res.status(201).json(place);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePlace = async (req, res) => {
  try {
    const updated = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Place not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePlace = async (req, res) => {
  try {
    const deleted = await Place.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Place not found" });
    res.json({ message: "Place deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

