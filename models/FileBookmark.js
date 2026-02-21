const mongoose = require("mongoose");

const fileBookmarkSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true }
);

fileBookmarkSchema.index({ user: 1, file: 1 }, { unique: true });

module.exports = mongoose.model("FileBookmark", fileBookmarkSchema);
