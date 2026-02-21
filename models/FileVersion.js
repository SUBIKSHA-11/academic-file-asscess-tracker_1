const mongoose = require("mongoose");

const fileVersionSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicFile",
      required: true
    },
    versionGroupId: {
      type: String,
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sourceFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicFile"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FileVersion", fileVersionSchema);
