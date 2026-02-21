const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    department: {
      type: String
    },

    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },

    subject: {
      type: String,
      required: true
    },

    unit: {
      type: String
    },

    category: {
      type: String,
      enum: ["NOTES", "QUESTION_PAPER", "MARKSHEET", "ASSIGNMENT", "LAB", "OTHER"],
      required: true
    },

    sensitivity: {
      type: String,
      enum: ["PUBLIC", "INTERNAL", "CONFIDENTIAL"],
      required: true
    },

    fileSize: {
      type: Number
    },

    downloadCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: {
      type: Date
    },
    publishedAt: {
      type: Date
    },
    rejectionReason: {
      type: String
    },
    versionGroupId: {
      type: String,
      index: true
    },
    versionNumber: {
      type: Number,
      default: 1
    },
    latestVersion: {
      type: Boolean,
      default: true
    },
    previousVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicFile"
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicFile", fileSchema);
