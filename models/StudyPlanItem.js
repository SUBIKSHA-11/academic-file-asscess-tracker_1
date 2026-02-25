const mongoose = require("mongoose");

const studyPlanItemSchema = new mongoose.Schema(
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
    reminderAt: {
      type: Date
    },
    note: {
      type: String,
      trim: true,
      default: ""
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

studyPlanItemSchema.index({ user: 1, file: 1 }, { unique: true });

module.exports = mongoose.model("StudyPlanItem", studyPlanItemSchema);
