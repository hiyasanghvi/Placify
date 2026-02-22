import express from "express";
import Placement from "../models/Placement.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET public opportunities
 */
router.get("/", async (req, res) => {
  try {
    const opportunities = await Placement.find({ isPublic: true })
      .populate("user", "name email college")
      .sort({ createdAt: -1 });

    res.json(opportunities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST new opportunity
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      company,
      role,
      pitch,
      skills,
      lookingFor
    } = req.body;

    // 🔴 HARD VALIDATION (important)
    if (!company || !role || !pitch) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const opportunity = await Placement.create({
      company,
      role,
      pitch,
      skills,
      lookingFor,
      isPublic: true,
      user: req.user.id   // 🔥 VERY IMPORTANT
    });

    const populated = await Placement.findById(opportunity._id)
      .populate("user", "name email college");

    res.status(201).json(populated);

  } catch (err) {
    console.error("POST OPPORTUNITY ERROR:", err);
    res.status(500).json({ message: "Could not create opportunity" });
  }
});

export default router;
