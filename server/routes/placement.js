import express from "express";
import Placement from "../models/Placement.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/placements
 * Create a new placement
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
company,
role,
status,
notes,
isPublic,
skills,
lookingFor,
pitch
} = req.body;

    if (!company || !role) {
      return res.status(400).json({ message: "Company and role are required" });
    }

    const placement = await Placement.create({
      user: req.user.id,
      company,
      role,
      status,
      notes,
      isPublic: isPublic ?? false,
      skills: skills || [],
      lookingFor: lookingFor || [],
      pitch: pitch || ""
    });

    res.status(201).json({
      message: "Placement added successfully",
      placement
    });
  } catch (error) {
    console.error("ADD PLACEMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/placements
 * Get all placements for logged-in user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const placements = await Placement.find({ user: req.user.id }).sort({ appliedDate: -1 });
    res.status(200).json(placements);
  } catch (error) {
    console.error("GET PLACEMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});
/**
 * PATCH /api/placements/:id
 * Update a placement by ID (only owner)
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { company, role, status, notes } = req.body;

    // find placement
    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ message: "Placement not found" });
    }

    // check ownership
    if (placement.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // update fields
    if (company) placement.company = company;
    if (role) placement.role = role;
    if (status) placement.status = status;
    if (notes) placement.notes = notes;

    await placement.save();

    res.status(200).json({
      message: "Placement updated successfully",
      placement
    });

  } catch (error) {
    console.error("UPDATE PLACEMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});
/**
 * DELETE /api/placements/:id
 * Delete a placement by ID (only owner)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ message: "Placement not found" });
    }

    // check ownership
    if (placement.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await placement.deleteOne();

    res.status(200).json({ message: "Placement deleted successfully" });

  } catch (error) {
    console.error("DELETE PLACEMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
