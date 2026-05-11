
// controllers/transportController.js
import Transport from "../models/transportModel.js";

/**
 * Controller for transport (CRUD)
 */

export const getTransports = async (req, res) => {
  try {
    const transports = await Transport.find().sort({ createdAt: -1 });
    res.json(transports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTransportById = async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) return res.status(404).json({ message: "Transport not found" });
    res.json(transport);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTransport = async (req, res) => {
  try {
    const payload = req.body;
    const transport = await Transport.create(payload);
    res.status(201).json(transport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTransport = async (req, res) => {
  try {
    const updated = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Transport not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTransport = async (req, res) => {
  try {
    const deleted = await Transport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Transport not found" });
    res.json({ message: "Transport deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

