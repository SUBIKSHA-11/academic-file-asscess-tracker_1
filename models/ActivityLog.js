const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  file: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicFile" },
  action: String,
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", logSchema);
