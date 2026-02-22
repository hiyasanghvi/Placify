import mongoose from "mongoose";

const placementSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["Applied", "OA", "Interview", "Offer", "Rejected"],
      default: "Applied"
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String
    },

    // ✅ NEW FIELDS FOR OPPORTUNITIES
    isPublic: {
      type: Boolean,
      default: false
    },
    skills: {
      type: [String],
      default: []
    },
    lookingFor: {
      type: [String],
      default: []
    },
    pitch: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Placement", placementSchema);