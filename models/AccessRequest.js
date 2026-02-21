const mongoose = require("mongoose");

const accessRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicFile",
      required: true
    },
    reason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    requestedDurationMinutes: {
      type: Number,
      default: 60
    },
    expiresAt: {
      type: Date
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: {
      type: Date
    },
    reviewNote: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

accessRequestSchema.index({ user: 1, file: 1, status: 1 });

module.exports = mongoose.model("AccessRequest", accessRequestSchema);
