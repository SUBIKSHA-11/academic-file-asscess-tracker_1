const AcademicFile = require("../models/AcademicFile");
const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");
const TemporaryAccess = require("../models/TemporaryAccess");
const FileVersion = require("../models/FileVersion");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cloudinary = require("../config/cloudinary");
const { isRemoteFilePath: isRemotePath, resolveLocalFilePath, isFileAvailable } = require("../utils/fileAvailability");

/* =========================
   HELPERS
========================= */

const latestFilter = {
  $or: [{ latestVersion: true }, { latestVersion: { $exists: false } }]
};

const publishedFilter = {
  $or: [{ status: "APPROVED" }, { status: { $exists: false } }]
};

const normalizeStatus = (value) => String(value || "APPROVED").toUpperCase();
const normalizeSensitivity = (value) => String(value || "PUBLIC").toUpperCase();
const attachAvailability = (file) => ({
  ...file.toObject(),
  isAvailable: isFileAvailable(file.filePath)
});
const CONTENT_TYPE_BY_EXTENSION = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip"
};

const resolveContentType = (fileName = "", fallback = "application/octet-stream") => {
  const extension = path.extname(String(fileName)).replace(".", "").toLowerCase();
  return CONTENT_TYPE_BY_EXTENSION[extension] || fallback;
};

const hasTemporaryAccess = async (userId, fileId) => {
  if (!userId || !fileId) return false;

  const access = await TemporaryAccess.findOne({
    user: userId,
    file: fileId,
    expiresAt: { $gt: new Date() }
  })
    .select("_id")
    .lean();

  return Boolean(access);
};

const canAccessFile = async (user, file, action = "view") => {
  if (!user || !file) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  if (user.role === "ADMIN") {
    return { ok: true };
  }

  const isOwner = String(file.uploadedBy) === String(user.userId || user.id);
  const status = normalizeStatus(file.status);
  const sensitivity = normalizeSensitivity(file.sensitivity);

  if (action === "delete") {
    if (user.role === "FACULTY" && isOwner) {
      return { ok: true };
    }

    return { ok: false, status: 403, message: "You are not allowed to delete this file" };
  }

  if (user.role === "FACULTY") {
    if (isOwner) {
      return { ok: true };
    }

    if (status !== "APPROVED") {
      return { ok: false, status: 403, message: "File is not published yet" };
    }

    if (["PUBLIC", "INTERNAL"].includes(sensitivity)) {
      return { ok: true };
    }

    return { ok: false, status: 403, message: "You are not allowed to access this file" };
  }

  if (user.role === "STUDENT") {
    if (status !== "APPROVED") {
      return { ok: false, status: 403, message: "File is not published yet" };
    }

    if (sensitivity === "PUBLIC") {
      return { ok: true };
    }

    const tempAccess = await hasTemporaryAccess(user.userId || user.id, file._id);
    if (tempAccess) {
      return { ok: true };
    }

    return { ok: false, status: 403, message: "You do not have access to this file" };
  }

  return { ok: false, status: 403, message: "You are not allowed to access this file" };
};

const useCloudinary = Boolean(
  process.env.CLOUD_NAME &&
  process.env.CLOUD_API_KEY &&
  process.env.CLOUD_API_SECRET
);

const uploadFileToCloudinary = async (localFilePath, originalName) => {
  const extension = path.extname(originalName).replace(".", "").toLowerCase();
  const publicIdBase = String(path.basename(originalName, path.extname(originalName)) || "file")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "file";

  return cloudinary.uploader.upload(localFilePath, {
    folder: "academic-files",
    resource_type: "raw",
    public_id: `${publicIdBase}-${new mongoose.Types.ObjectId()}${extension ? `.${extension}` : ""}`
  });
};

/* =========================
   UPLOAD FILE
========================= */

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploaderId = req.user.userId;
    const status = req.user.role === "ADMIN" ? "APPROVED" : "PENDING";

    let storedFilePath = req.file.path;

    if (useCloudinary && req.file.path) {
      const cloudinaryResult = await uploadFileToCloudinary(req.file.path, req.file.originalname);
      storedFilePath = cloudinaryResult.secure_url || cloudinaryResult.url;
      fs.unlink(req.file.path, () => {});
    }

    const newFile = await AcademicFile.create({
      fileName: req.file.originalname,
      filePath: storedFilePath || req.file.secure_url || req.file.url,
      department: req.body.department,
      year: req.body.year,
      semester: req.body.semester,
      subject: req.body.subject,
      unit: req.body.unit,
      category: req.body.category,
      sensitivity: req.body.sensitivity,
      fileSize: req.file.size,
      uploadedBy: uploaderId,
      status,
      latestVersion: true
    });

    await ActivityLog.create({
      user: uploaderId,
      file: newFile._id,
      action: "UPLOAD",
      ipAddress: req.ip
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: newFile
    });

  } catch (err) {
    console.error(err);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      message: err?.message || err?.error?.message || "Upload failed"
    });
  }
};

const getCloudinaryAssetMeta = (filePath) => {
  try {
    const parsed = new URL(filePath);
    const marker = "/upload/";
    const uploadIndex = parsed.pathname.indexOf(marker);

    if (uploadIndex === -1) {
      return null;
    }

    const assetPath = parsed.pathname.slice(uploadIndex + marker.length);
    const normalizedAssetPath = assetPath.replace(/^v\d+\//, "");
    const extension = path.extname(normalizedAssetPath).replace(".", "").toLowerCase();
    const publicIdWithExtension = normalizedAssetPath;
    const publicIdWithoutExtension = extension
      ? normalizedAssetPath.slice(0, -(extension.length + 1))
      : normalizedAssetPath;

    return {
      extension,
      publicIdWithExtension,
      publicIdWithoutExtension
    };
  } catch (error) {
    return null;
  }
};

const fetchRemoteFileBuffer = async (file) => {
  const cloudinaryMeta = getCloudinaryAssetMeta(file.filePath);
  const candidateUrls = [];

  if (cloudinaryMeta?.publicIdWithExtension) {
    candidateUrls.push(
      cloudinary.utils.private_download_url(
        cloudinaryMeta.publicIdWithExtension,
        "",
        {
          resource_type: "raw",
          type: "upload",
          expires_at: Math.floor(Date.now() / 1000) + 60
        }
      )
    );
  }

  if (cloudinaryMeta?.publicIdWithoutExtension) {
    candidateUrls.push(
      cloudinary.utils.private_download_url(
        cloudinaryMeta.publicIdWithoutExtension,
        cloudinaryMeta.extension || path.extname(file.fileName).replace(".", "").toLowerCase(),
        {
          resource_type: "raw",
          type: "upload",
          expires_at: Math.floor(Date.now() / 1000) + 60
        }
      )
    );
  }

  candidateUrls.push(file.filePath);

  let lastError = null;
  for (const candidateUrl of candidateUrls) {
    try {
      return await axios.get(candidateUrl, {
        responseType: "arraybuffer",
        validateStatus: (status) => status >= 200 && status < 300
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to fetch remote file");
};

const sendFileResponse = async (res, file, disposition = "inline") => {
  if (isRemotePath(file.filePath)) {
    const remoteResponse = await fetchRemoteFileBuffer(file);
    const upstreamType = remoteResponse.headers?.["content-type"];
    const upstreamLength = remoteResponse.headers?.["content-length"];

    res.setHeader(
      "Content-Type",
      resolveContentType(file.fileName, upstreamType || "application/octet-stream")
    );
    if (upstreamLength) {
      res.setHeader("Content-Length", upstreamLength);
    }
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${encodeURIComponent(file.fileName)}"`
    );

    return res.send(Buffer.from(remoteResponse.data));
  }

  const localPath = resolveLocalFilePath(file.filePath);
  if (!localPath || !fs.existsSync(localPath)) {
    return res.status(404).json({ message: "Stored file not found" });
  }

  if (disposition === "attachment") {
    return res.download(localPath, file.fileName);
  }

  return res.sendFile(localPath);
};

/* =========================
   GET FILES
========================= */

const getFiles = async (req, res) => {
  try {
    let filter = { ...latestFilter };

    if (req.user.role === "STUDENT") {
      filter = {
        $and: [
          latestFilter,
          publishedFilter,
          { sensitivity: "PUBLIC" }
        ]
      };
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const files = await AcademicFile.find(filter)
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 })
      .lean(false);

    const availableFiles = files
      .map(attachAvailability)
      .filter((file) => file.isAvailable);

    const totalFiles = availableFiles.length;
    const paginatedFiles = availableFiles.slice(skip, skip + limit);

    res.json({
      files: paginatedFiles,
      totalFiles,
      totalPages: Math.max(1, Math.ceil(totalFiles / limit)),
      currentPage: page
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch files" });
  }
};

/* =========================
   FILTER FILES
========================= */

const filterFiles = async (req, res) => {
  try {

    const { category, year, department, semester, subject } = req.query;

    let filter = { ...latestFilter };

    if (category) filter.category = category;
    if (year) filter.year = year;
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;

    const files = await AcademicFile.find(filter)
      .populate("uploadedBy", "name role");

    res.json(files);

  } catch (err) {
    res.status(500).json({ message: "Filter failed" });
  }
};

/* =========================
   DOWNLOAD FILE
========================= */

const downloadFile = async (req, res) => {
  try {

    const file = await AcademicFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const access = await canAccessFile(req.user, file, "download");
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    file.downloadCount += 1;
    await file.save();

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "DOWNLOAD",
      ipAddress: req.ip
    });

    return await sendFileResponse(res, file, "attachment");

  } catch (err) {
    console.error("Download failed:", err?.response?.data || err?.message || err);
    res.status(500).json({ message: "Download failed" });
  }
};

/* =========================
   VIEW FILE
========================= */

const viewFile = async (req, res) => {
  try {

    const file = await AcademicFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const access = await canAccessFile(req.user, file, "view");
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    file.viewCount = Number(file.viewCount || 0) + 1;
    await file.save();

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "VIEW",
      ipAddress: req.ip
    });

    return await sendFileResponse(res, file, "inline");

  } catch (err) {
    console.error("View failed:", err?.response?.data || err?.message || err);
    res.status(500).json({ message: "View failed" });
  }
};

/* =========================
   DELETE FILE
========================= */

const deleteFile = async (req, res) => {
  try {

    const file = await AcademicFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const access = await canAccessFile(req.user, file, "delete");
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    await AcademicFile.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "DELETE",
      ipAddress: req.ip
    });

    res.json({ message: "File deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

/* =========================
   ADMIN FEATURES
========================= */

const getPendingFiles = async (req, res) => {
  try {

    const files = await AcademicFile.find({
      status: "PENDING",
      ...latestFilter
    }).populate("uploadedBy", "name email");

    res.json(files);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending files" });
  }
};

const approveFile = async (req, res) => {
  try {

    const file = await AcademicFile.findById(req.params.id);

    file.status = "APPROVED";
    file.approvedBy = req.user.userId;
    file.approvedAt = new Date();

    await file.save();

    res.json({ message: "File approved", file });

  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
};

const rejectFile = async (req, res) => {
  try {

    const file = await AcademicFile.findById(req.params.id);

    file.status = "REJECTED";
    file.rejectionReason = req.body.reason || "Rejected";

    await file.save();

    res.json({ message: "File rejected", file });

  } catch (err) {
    res.status(500).json({ message: "Reject failed" });
  }
};

/* =========================
   VERSION HISTORY
========================= */

const getFileVersions = async (req, res) => {
  try {

    const file = await AcademicFile.findById(req.params.id);

    const versions = await AcademicFile.find({
      versionGroupId: file.versionGroupId
    }).sort({ versionNumber: -1 });

    res.json(versions);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch versions" });
  }
};

const restoreVersion = async (req, res) => {
  try {

    const target = await AcademicFile.findById(req.params.id);

    const restored = await AcademicFile.create({
      ...target.toObject(),
      _id: new mongoose.Types.ObjectId(),
      latestVersion: true
    });

    res.json({
      message: "Version restored",
      file: restored
    });

  } catch (err) {
    res.status(500).json({ message: "Restore failed" });
  }
};

/* =========================
   EXPORT
========================= */

module.exports = {
  uploadFile,
  getFiles,
  filterFiles,
  downloadFile,
  deleteFile,
  viewFile,
  getPendingFiles,
  approveFile,
  rejectFile,
  getFileVersions,
  restoreVersion
};
