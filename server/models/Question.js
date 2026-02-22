import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["MCQ", "CODING"],
      required: true
    },
    options: [String], // MCQ only
    correctAnswer: Number, // MCQ index
    starterCode: String, // coding only
    topic: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question; // ✅ THIS FIXES IT