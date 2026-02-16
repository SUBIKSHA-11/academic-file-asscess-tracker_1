const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: String,
  severity: String
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
