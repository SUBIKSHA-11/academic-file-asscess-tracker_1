const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
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
  action: {
    type: String,
    enum: ["UPLOAD", "DOWNLOAD", "VIEW", "DELETE", "BOOKMARK", "REQUEST_ACCESS", "APPROVE_ACCESS", "REJECT_ACCESS", "APPROVE_FILE", "REJECT_FILE", "RESTORE_VERSION"],
    required: true
  },
  ipAddress: {
    type: String
  },
  metadata: {
    type: Object
  }
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
