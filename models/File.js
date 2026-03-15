const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileName: String,
  fileURL: String,
  uploadedBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("File", fileSchema);
