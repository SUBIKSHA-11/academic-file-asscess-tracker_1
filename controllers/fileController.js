const AcademicFile = require("../models/AcademicFile");
const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");
const TemporaryAccess = require("../models/TemporaryAccess");
const path = require("path");
const fs = require("fs");

const resolveStoredFilePath = (storedPath) => {
  if (!storedPath) return null;
  return path.isAbsolute(storedPath)
    ? storedPath
    : path.join(__dirname, "..", storedPath);
};

// =============================
// UPLOAD FILE
// =============================
const uploadFile = async (req, res) => {
  try {
    const {
      department,
      year,
      semester,
      subject,
      unit,
      category,
      sensitivity
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newFile = await AcademicFile.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      department,
      year,
      semester,
      subject,
      unit,
      category,
      sensitivity,
      fileSize: req.file.size,
      downloadCount: 0,
      uploadedBy: req.user.userId
    });

    // 🔥 Log Upload Activity
    await ActivityLog.create({
      user: req.user.userId,
      file: newFile._id,
      action: "UPLOAD",
      ipAddress: req.ip
    });
    console.log("REQ.USER:", req.user);
console.log("REQ.FILE:", req.file);
console.log("REQ.BODY:", req.body);


    res.status(201).json({
      message: "File uploaded and saved successfully",
      file: newFile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// =============================
// GET FILES WITH PAGINATION
// =============================
const getFiles = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const sortBy = req.query.sortBy || "createdAt";

    const skip = (page - 1) * limit;

    let filter = {};

    if (req.user.role === "FACULTY") {
      filter.sensitivity = { $in: ["PUBLIC", "INTERNAL"] };
    }

    if (req.user.role === "STUDENT") {
      filter.sensitivity = "PUBLIC";
    }

    const totalFiles = await AcademicFile.countDocuments(filter);

    const files = await AcademicFile.find(filter)
      .populate("uploadedBy", "name role")
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalFiles / limit),
      totalFiles,
      files
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch files" });
  }
};

// =============================
// FILTER FILES
// =============================
const filterFiles = async (req, res) => {
  try {
    const { category, year, department, semester, subject } = req.query;

    let filter = {};

    if (req.user.role === "FACULTY") {
      filter.sensitivity = { $in: ["PUBLIC", "INTERNAL"] };
    }

    if (req.user.role === "STUDENT") {
      filter.sensitivity = "PUBLIC";
    }

    if (category) filter.category = category;
    if (year) filter.year = Number(year);
    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);
    if (subject) filter.subject = subject;

    const files = await AcademicFile.find(filter)
      .populate("uploadedBy", "name role");

    res.json(files);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Filter failed" });
  }
};

// =============================
// DOWNLOAD FILE
// =============================
const downloadFile = async (req, res) => {
  try {
    const file = await AcademicFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const tempAccess = await TemporaryAccess.findOne({
      user: req.user.userId,
      file: file._id,
      expiresAt: { $gt: new Date() }
    });

    const hasTempAccess = !!tempAccess;

    if (
      (req.user.role === "STUDENT" && file.sensitivity !== "PUBLIC" && !hasTempAccess) ||
      (req.user.role === "FACULTY" && file.sensitivity === "CONFIDENTIAL" && !hasTempAccess)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    file.downloadCount += 1;
    await file.save();

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "DOWNLOAD",
      ipAddress: req.ip
    });

    // Suspicious Detection
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const recentDownloads = await ActivityLog.countDocuments({
      user: req.user.userId,
      action: "DOWNLOAD",
      createdAt: { $gte: twoMinutesAgo }
    });

    if (recentDownloads >= 5) {
      await Alert.create({
        user: req.user.userId,
        reason: "Multiple downloads within short time",
        severity: "HIGH"
      });
    }

    const fileFullPath = resolveStoredFilePath(file.filePath);
    if (!fileFullPath || !fs.existsSync(fileFullPath)) {
      return res.status(404).json({ message: "Physical file not found" });
    }
    res.download(fileFullPath, file.fileName);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Download failed" });
  }
};

// =============================
// DELETE FILE
// =============================
const deleteFile = async (req, res) => {
  try {
    const file = await AcademicFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (req.user.role === "STUDENT") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (
      req.user.role === "FACULTY" &&
      file.uploadedBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "You can delete only your own files" });
    }

    const fileFullPath = resolveStoredFilePath(file.filePath);

    if (fileFullPath && fs.existsSync(fileFullPath)) {
      fs.unlinkSync(fileFullPath);
    }

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "DELETE",
      ipAddress: req.ip
    });

    await AcademicFile.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
};

// =============================
// VIEW FILE
// =============================
const viewFile = async (req, res) => {
  try {
    const file = await AcademicFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const tempAccess = await TemporaryAccess.findOne({
      user: req.user.userId,
      file: file._id,
      expiresAt: { $gt: new Date() }
    });

    const hasTempAccess = !!tempAccess;

    if (
      (req.user.role === "STUDENT" && file.sensitivity !== "PUBLIC" && !hasTempAccess) ||
      (req.user.role === "FACULTY" && file.sensitivity === "CONFIDENTIAL" && !hasTempAccess)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const fileFullPath = resolveStoredFilePath(file.filePath);

    if (!fs.existsSync(fileFullPath)) {
      return res.status(404).json({ message: "Physical file not found" });
    }

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "VIEW",
      ipAddress: req.ip
    });
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
    res.sendFile(fileFullPath);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "View failed" });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  downloadFile,
  filterFiles,
  deleteFile,
  viewFile
};
