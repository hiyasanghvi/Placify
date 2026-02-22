import express from "express";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";
import authMiddleware from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
const router = express.Router();

/**
 * GET /api/oa/questions
 */
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const { topic, difficulty } = req.query;

    const questions = await Question.aggregate([
      { $match: { topic, difficulty } },
      { $sample: { size: 5 } } // keep small
    ]);

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch OA" });
  }
});

/**
 * POST /api/oa/submit
 */
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { answers, topic, difficulty } = req.body;

    let score = 0;
    let total = 0;
    const evaluated = [];

    for (const item of answers) {
      const question = await Question.findById(item.questionId);

      let correct = null;

      if (question.type === "MCQ") {
        correct = question.correctAnswer === item.selected;
        if (correct) score++;
        total++;
      }

      if (question.type === "CODING") {
        total++; // counted but not graded
      }

      evaluated.push({
        question: question._id,
        selected: item.selected,
        correct
      });
    }

    const status =
      score >= Math.ceil(total * 0.6) ? "PASSED" : "FAILED";

    const attempt = await Attempt.create({
      user: req.user.id,
      topic,
      difficulty,
      score,
      total,
      status,
      answers: evaluated
    });

    res.json({
      attemptId: attempt._id,
      score,
      total,
      status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Submit failed" });
  }
});
// GET last OA result
router.get("/result/:attemptId", authMiddleware, async (req, res) => {
  const { attemptId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    return res.status(400).json({ message: "Invalid attempt ID" });
  }

  const attempt = await Attempt.findById(attemptId)
    .populate("answers.question");

  if (!attempt) {
    return res.status(404).json({ message: "Result not found" });
  }

  res.json(attempt);
});
export default router;