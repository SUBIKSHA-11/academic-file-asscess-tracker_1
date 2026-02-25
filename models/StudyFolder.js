const mongoose = require("mongoose");

const studyFolderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      trim: true,
      default: ""
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicFile"
      }
    ]
  },
  { timestamps: true }
);

studyFolderSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("StudyFolder", studyFolderSchema);
