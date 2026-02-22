import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topic: String,
    difficulty: String,

    score: Number,
    total: Number,

    status: {
      type: String,
      enum: ["PASSED", "FAILED"]
    },

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question"
        },
        selected: mongoose.Schema.Types.Mixed,

        // ✅ allow null for coding questions
        correct: {
          type: Boolean,
          default: null
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Attempt", attemptSchema);