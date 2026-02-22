import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    college: String,
    year: Number,
    role: String,
    skills: [String],
    resume_url: String,
    ats_score: {
      type: Number,
      default: 0
    },
    is_premium: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
