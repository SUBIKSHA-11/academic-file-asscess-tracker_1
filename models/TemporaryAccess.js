const mongoose = require("mongoose");

const temporaryAccessSchema = new mongoose.Schema({
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
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("TemporaryAccess", temporaryAccessSchema);
