import express from "express";
import Referral from "../models/Referral.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { company, role, message } = req.body;

    if (!company || !role) {
      return res.status(400).json({ message: "Company and role required" });
    }

    const referral = await Referral.create({
      user: req.user.id,
      company,
      role,
      message
    });

    res.status(201).json(referral);
  } catch (err) {
    console.error("REFERRAL POST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate("user", "name college year")
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    console.error("REFERRAL GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/**
 * PATCH /api/referrals/:id
 * Update referral (only owner)
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const referral = await Referral.findById(id);

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // 🔐 ownership check
    if (referral.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // update allowed fields
    if (status) referral.status = status;
    if (message) referral.message = message;

    await referral.save();

    res.status(200).json({
      message: "Referral updated successfully",
      referral
    });

  } catch (error) {
    console.error("UPDATE REFERRAL ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});
/**
 * DELETE /api/referrals/:id
 * Delete referral (only owner)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const referral = await Referral.findById(id);

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // 🔐 ownership check
    if (referral.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await referral.deleteOne();

    res.status(200).json({
      message: "Referral deleted successfully"
    });

  } catch (error) {
    console.error("DELETE REFERRAL ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
