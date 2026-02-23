const mongoose = require("mongoose");

const fileFeedbackSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicFile",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    isHelpful: {
      type: Boolean,
      required: true
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

fileFeedbackSchema.index({ fileId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("FileFeedback", fileFeedbackSchema);
