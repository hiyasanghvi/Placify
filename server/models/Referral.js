import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    company: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    message: String,
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Referral", referralSchema);
