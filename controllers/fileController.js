const AcademicFile = require("../models/AcademicFile");
const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");
const TemporaryAccess = require("../models/TemporaryAccess");
const FileVersion = require("../models/FileVersion");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const resolveStoredFilePath = (storedPath) => {
  if (!storedPath) return null;
  return path.isAbsolute(storedPath)
    ? storedPath
    : path.join(__dirname, "..", storedPath);
};

const buildAccessFlags = (file, reqUser) => {
  const userId = reqUser.userId || reqUser.id;
  const isAdmin = reqUser.role === "ADMIN";
  const isOwner = String(file.uploadedBy) === String(userId);
  return { isAdmin, isOwner, userId };
};

const latestFilter = {
  $or: [{ latestVersion: true }, { latestVersion: { $exists: false } }]
};

const publishedFilter = {
  $or: [{ status: "APPROVED" }, { status: { $exists: false } }]
};

const isPublishedFile = (file) => !file.status || file.status === "APPROVED";
const getSensitivity = (file) => {
  const value = String(file?.sensitivity || "PUBLIC").trim().toUpperCase();
  if (["PUBLIC", "INTERNAL", "CONFIDENTIAL"].includes(value)) return value;
  return "PUBLIC";
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

    const uploaderId = req.user.userId;
    const shouldAutoApprove = req.user.role === "ADMIN";
    const status = shouldAutoApprove ? "APPROVED" : "PENDING";
    const now = new Date();

    const previousLatest = await AcademicFile.findOne({
      uploadedBy: uploaderId,
      fileName: req.file.originalname,
      department,
      semester: Number(semester),
      subject,
      category,
      latestVersion: true
    });

    let versionGroupId = previousLatest?.versionGroupId;
    let versionNumber = 1;
    let previousVersion = null;

    if (previousLatest) {
      previousLatest.latestVersion = false;
      await previousLatest.save();
      versionGroupId = versionGroupId || String(previousLatest._id);
      versionNumber = Number(previousLatest.versionNumber || 1) + 1;
      previousVersion = previousLatest._id;
    }

    if (!versionGroupId) {
      versionGroupId = new mongoose.Types.ObjectId().toString();
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
      uploadedBy: uploaderId,
      status,
      approvedBy: shouldAutoApprove ? uploaderId : null,
      approvedAt: shouldAutoApprove ? now : null,
      publishedAt: shouldAutoApprove ? now : null,
      versionGroupId,
      versionNumber,
      previousVersion,
      latestVersion: true
    });

    await FileVersion.create({
      file: newFile._id,
      versionGroupId,
      versionNumber,
      filePath: req.file.path,
      fileName: req.file.originalname,
      uploadedBy: uploaderId,
      sourceFile: previousVersion
    });

    // 🔥 Log Upload Activity
    await ActivityLog.create({
      user: req.user.userId,
      file: newFile._id,
      action: "UPLOAD",
      ipAddress: req.ip,
      metadata: {
        status,
        versionNumber
      }
    });

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

    let filter = { ...latestFilter };

    if (req.user.role === "FACULTY") {
      filter = {
        $and: [
          latestFilter,
          {
            $or: [
              {
                $and: [
                  { sensitivity: { $in: ["PUBLIC", "INTERNAL"] } },
                  publishedFilter
                ]
              },
              { uploadedBy: req.user.userId }
            ]
          }
        ]
      };
    }

    if (req.user.role === "STUDENT") {
      filter = {
        $and: [
          latestFilter,
          publishedFilter,
          { sensitivity: "PUBLIC" }
        ],
      };
    }

    if (req.user.role === "ADMIN") {
      filter = { ...latestFilter };
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

    let filter = { ...latestFilter };

    if (req.user.role === "FACULTY") {
      filter = {
        $and: [
          latestFilter,
          {
            $or: [
              {
                $and: [
                  { sensitivity: { $in: ["PUBLIC", "INTERNAL"] } },
                  publishedFilter
                ]
              },
              { uploadedBy: req.user.userId }
            ]
          }
        ]
      };
    }

    if (req.user.role === "STUDENT") {
      filter = {
        $and: [
          latestFilter,
          publishedFilter,
          { sensitivity: "PUBLIC" }
        ]
      };
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

    const { isAdmin, isOwner } = buildAccessFlags(file, req.user);
    if (!isPublishedFile(file) && !isAdmin && !isOwner) {
      return res.status(403).json({ message: "File is not published yet" });
    }

    const tempAccess = await TemporaryAccess.findOne({
      user: req.user.userId,
      file: file._id,
      expiresAt: { $gt: new Date() }
    });

    const hasTempAccess = !!tempAccess;

    const sensitivity = getSensitivity(file);
    if (
      (req.user.role === "STUDENT" && sensitivity !== "PUBLIC" && !hasTempAccess) ||
      (req.user.role === "FACULTY" && sensitivity === "CONFIDENTIAL" && !hasTempAccess)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    file.downloadCount += 1;
    await file.save();

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "DOWNLOAD",
      ipAddress: req.ip,
      metadata: {
        watermarkUser: req.user.name || req.user.userId,
        watermarkTime: new Date().toISOString()
      }
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
    const ext = path.extname(file.fileName);
    const base = path.basename(file.fileName, ext);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeUser = String(req.user.name || req.user.userId).replace(/[^a-zA-Z0-9_-]/g, "_");
    const watermarkedName = `${base}__wm_${safeUser}_${stamp}${ext}`;

    res.setHeader("X-Download-Watermark-User", String(req.user.name || req.user.userId));
    res.setHeader("X-Download-Watermark-Time", new Date().toISOString());
    res.download(fileFullPath, watermarkedName);

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

    const { isAdmin, isOwner } = buildAccessFlags(file, req.user);
    if (!isPublishedFile(file) && !isAdmin && !isOwner) {
      return res.status(403).json({ message: "File is not published yet" });
    }

    const tempAccess = await TemporaryAccess.findOne({
      user: req.user.userId,
      file: file._id,
      expiresAt: { $gt: new Date() }
    });

    const hasTempAccess = !!tempAccess;

    const sensitivity = getSensitivity(file);
    if (
      (req.user.role === "STUDENT" && sensitivity !== "PUBLIC" && !hasTempAccess) ||
      (req.user.role === "FACULTY" && sensitivity === "CONFIDENTIAL" && !hasTempAccess)
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
    res.type(file.fileName);
    res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
    res.sendFile(fileFullPath);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "View failed" });
  }
};

const getPendingFiles = async (req, res) => {
  try {
    const files = await AcademicFile.find({
      ...latestFilter,
      status: "PENDING"
    })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending files" });
  }
};

const approveFile = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can approve files" });
    }

    const file = await AcademicFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    file.status = "APPROVED";
    file.approvedBy = req.user.userId;
    file.approvedAt = new Date();
    file.publishedAt = new Date();
    file.rejectionReason = "";
    await file.save();

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "APPROVE_FILE",
      ipAddress: req.ip
    });

    res.json({ message: "File approved and published", file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve file" });
  }
};

const rejectFile = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can reject files" });
    }

    const file = await AcademicFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    file.status = "REJECTED";
    file.rejectionReason = req.body.reason || "Rejected by reviewer";
    file.approvedBy = req.user.userId;
    file.approvedAt = new Date();
    await file.save();

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "REJECT_FILE",
      ipAddress: req.ip,
      metadata: { reason: file.rejectionReason }
    });

    res.json({ message: "File rejected", file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reject file" });
  }
};

const getFileVersions = async (req, res) => {
  try {
    const file = await AcademicFile.findById(req.params.id).lean();
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const versionGroupId = file.versionGroupId || String(file._id);
    const versions = await AcademicFile.find({
      uploadedBy: file.uploadedBy,
      $or: [{ versionGroupId }, { _id: file._id }]
    })
      .select("fileName versionNumber latestVersion status createdAt uploadedBy")
      .populate("uploadedBy", "name")
      .sort({ versionNumber: -1 });

    res.json(versions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch versions" });
  }
};

const restoreVersion = async (req, res) => {
  try {
    const target = await AcademicFile.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: "File not found" });
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = String(target.uploadedBy) === String(req.user.userId);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    await AcademicFile.updateMany(
      { versionGroupId: target.versionGroupId, uploadedBy: target.uploadedBy },
      { $set: { latestVersion: false } }
    );

    const restored = await AcademicFile.create({
      fileName: target.fileName,
      filePath: target.filePath,
      department: target.department,
      year: target.year,
      semester: target.semester,
      subject: target.subject,
      unit: target.unit,
      category: target.category,
      sensitivity: target.sensitivity,
      fileSize: target.fileSize,
      downloadCount: target.downloadCount,
      uploadedBy: target.uploadedBy,
      status: "APPROVED",
      approvedBy: req.user.userId,
      approvedAt: new Date(),
      publishedAt: new Date(),
      versionGroupId: target.versionGroupId,
      versionNumber: Number(target.versionNumber || 1) + 1,
      latestVersion: true,
      previousVersion: target._id
    });

    await FileVersion.create({
      file: restored._id,
      versionGroupId: restored.versionGroupId,
      versionNumber: restored.versionNumber,
      filePath: restored.filePath,
      fileName: restored.fileName,
      uploadedBy: req.user.userId,
      sourceFile: target._id
    });

    await ActivityLog.create({
      user: req.user.userId,
      file: restored._id,
      action: "RESTORE_VERSION",
      ipAddress: req.ip,
      metadata: { restoredFrom: String(target._id) }
    });

    res.json({ message: "Version restored as latest", file: restored });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to restore version" });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  downloadFile,
  filterFiles,
  deleteFile,
  viewFile,
  getPendingFiles,
  approveFile,
  rejectFile,
  getFileVersions,
  restoreVersion
};
