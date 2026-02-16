const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
