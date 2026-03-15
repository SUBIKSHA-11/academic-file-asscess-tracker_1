const AcademicFile = require("../models/AcademicFile");
const Department = require("../models/Department");
const ActivityLog = require("../models/ActivityLog");
const FileBookmark = require("../models/FileBookmark");
const TemporaryAccess = require("../models/TemporaryAccess");
const AccessRequest = require("../models/AccessRequest");
const User = require("../models/User");
const mongoose = require("mongoose");
const StudyFolder = require("../models/StudyFolder");
const StudyPlanItem = require("../models/StudyPlanItem");
const { isFileAvailable } = require("../utils/fileAvailability");
const normalizeSensitivity = (value) => {
  const normalized = String(value || "PUBLIC").trim().toUpperCase();
  if (["PUBLIC", "INTERNAL", "CONFIDENTIAL"].includes(normalized)) {
    return normalized;
  }
  return "PUBLIC";
};

const getStudentFiles = async (req, res) => {
  try {
    const [bookmarks, tempAccess] = await Promise.all([
      FileBookmark.find({ user: req.user.userId }).select("file").lean(),
      TemporaryAccess.find({
        user: req.user.userId,
        expiresAt: { $gt: new Date() }
      }).select("file").lean()
    ]);

    const bookmarkedIds = new Set(bookmarks.map((b) => String(b.file)));
    const tempAccessIds = new Set(tempAccess.map((a) => String(a.file)));

    const files = await AcademicFile.find({
      $and: [
        { $or: [{ latestVersion: true }, { latestVersion: { $exists: false } }] },
        { $or: [{ status: "APPROVED" }, { status: { $exists: false } }] }
      ]
    })
      .select("fileName filePath semester category department subject downloadCount createdAt sensitivity avgRating totalRatings helpfulPercentage")
      .sort({ createdAt: -1 })
      .lean();

    const departmentNames = [...new Set(files.map((f) => f.department).filter(Boolean))];
    const departments = await Department.find({ name: { $in: departmentNames } })
      .select("_id name")
      .lean();

    const departmentMap = departments.reduce((acc, dept) => {
      acc[dept.name] = { _id: dept._id, name: dept.name };
      return acc;
    }, {});

    const normalized = files.map((file) => {
      const available = isFileAvailable(file.filePath);
      return {
        _id: file._id,
        fileName: file.fileName,
        semester: file.semester,
        category: file.category,
        department: departmentMap[file.department] || {
          _id: null,
          name: file.department || "Unknown Department"
        },
        subject: file.subject,
        downloadCount: file.downloadCount || 0,
        avgRating: file.avgRating || 0,
        totalRatings: file.totalRatings || 0,
        helpfulPercentage: file.helpfulPercentage || 0,
        createdAt: file.createdAt,
        sensitivity: normalizeSensitivity(file.sensitivity),
        canAccess:
          available &&
          (normalizeSensitivity(file.sensitivity) === "PUBLIC" || tempAccessIds.has(String(file._id))),
        isAvailable: available,
        isBookmarked: bookmarkedIds.has(String(file._id))
      };
    });

    res.json(normalized.filter((file) => file.isAvailable));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch student files" });
  }
};

const getStudentMyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const [downloads, views, totalAccessResult, uniqueFiles, downloadsThisWeek, categoryAgg, student] = await Promise.all([
      ActivityLog.countDocuments({ user: userId, action: "DOWNLOAD" }),
      ActivityLog.countDocuments({ user: userId, action: "VIEW" }),
      ActivityLog.countDocuments({ user: userId, action: { $in: ["VIEW", "DOWNLOAD"] } }),
      ActivityLog.distinct("file", { user: userId, action: { $in: ["VIEW", "DOWNLOAD"] } }),
      ActivityLog.countDocuments({
        user: userId,
        action: "DOWNLOAD",
        createdAt: { $gte: weekStart }
      }),
      ActivityLog.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            action: "DOWNLOAD"
          }
        },
        {
          $lookup: {
            from: "academicfiles",
            localField: "file",
            foreignField: "_id",
            as: "fileDoc"
          }
        },
        { $unwind: "$fileDoc" },
        {
          $group: {
            _id: "$fileDoc.category",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),
      User.findById(userId).select("currentStreak longestStreak badges").lean()
    ]);

    res.json({
      totalDownloads: downloads,
      totalViews: views,
      totalAccessActions: totalAccessResult,
      uniqueFilesAccessed: uniqueFiles.length,
      downloadsThisWeek,
      mostDownloadedCategory: categoryAgg[0]?._id || "N/A",
      currentStreak: student?.currentStreak || 0,
      longestStreak: student?.longestStreak || 0,
      badges: student?.badges || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch student stats" });
  }
};

const getStudentAccessGrid = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const days = Number(req.query.days) || 120;
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days + 1);
    since.setUTCHours(0, 0, 0, 0);

    const logs = await ActivityLog.find({
      user: userId,
      action: { $in: ["VIEW", "DOWNLOAD"] },
      createdAt: { $gte: since }
    })
      .select("createdAt")
      .lean();

    const counts = logs.reduce((acc, log) => {
      const key = new Date(log.createdAt).toISOString().slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const grid = [];
    const cursor = new Date(since);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10);
      grid.push({ date: key, count: counts[key] || 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    res.json(grid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch access grid" });
  }
};

const getRecentAccess = async (req, res) => {
  try {
    const logs = await ActivityLog.find({
      user: req.user.userId,
      action: { $in: ["VIEW", "DOWNLOAD"] }
    })
      .populate("file", "fileName subject")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recent access" });
  }
};

const getBookmarkedFiles = async (req, res) => {
  try {
    const activeAccess = await TemporaryAccess.find({
      user: req.user.userId,
      expiresAt: { $gt: new Date() }
    }).select("file").lean();
    const tempAccessIds = new Set(activeAccess.map((a) => String(a.file)));

    const bookmarks = await FileBookmark.find({ user: req.user.userId })
      .populate({
        path: "file",
        select: "fileName filePath subject semester category department sensitivity status createdAt latestVersion",
        match: {
          $or: [{ latestVersion: true }, { latestVersion: { $exists: false } }]
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    const data = bookmarks
      .filter((item) => item.file)
      .map((item) => {
        const available = isFileAvailable(item.file.filePath);
        return {
          ...item.file,
          sensitivity: normalizeSensitivity(item.file.sensitivity),
          canAccess:
            available &&
            (
              normalizeSensitivity(item.file.sensitivity) === "PUBLIC" ||
              tempAccessIds.has(String(item.file._id))
            ),
          isAvailable: available,
          isBookmarked: true,
          bookmarkedAt: item.createdAt
        };
      });
    res.json(data.filter((file) => file.isAvailable));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const file = await AcademicFile.findById(req.params.fileId).select("_id");
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const existing = await FileBookmark.findOne({
      user: req.user.userId,
      file: file._id
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ message: "Bookmark removed", bookmarked: false });
    }

    await FileBookmark.create({
      user: req.user.userId,
      file: file._id
    });

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "BOOKMARK",
      ipAddress: req.ip
    });

    return res.json({ message: "Bookmarked", bookmarked: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update bookmark" });
  }
};

const getRecentFiles = async (req, res) => {
  try {
    const activeAccess = await TemporaryAccess.find({
      user: req.user.userId,
      expiresAt: { $gt: new Date() }
    }).select("file").lean();
    const tempAccessIds = new Set(activeAccess.map((a) => String(a.file)));

    const logs = await ActivityLog.find({
      user: req.user.userId,
      action: { $in: ["VIEW", "DOWNLOAD"] }
    })
      .populate("file", "fileName filePath subject semester category department sensitivity status latestVersion")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const seen = new Set();
    const recent = [];
    for (const log of logs) {
      if (!log.file || !log.file._id) continue;
      if (log.file.latestVersion === false) continue;
      const fileId = String(log.file._id);
      if (seen.has(fileId)) continue;
      seen.add(fileId);
      const sensitivity = normalizeSensitivity(log.file.sensitivity);
      const available = isFileAvailable(log.file.filePath);
      recent.push({
        ...log.file,
        sensitivity,
        canAccess: available && (sensitivity === "PUBLIC" || tempAccessIds.has(fileId)),
        isAvailable: available,
        lastAction: log.action,
        lastAccessedAt: log.createdAt
      });
      if (recent.length >= 10) break;
    }

    res.json(recent.filter((file) => file.isAvailable));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recent files" });
  }
};

const requestRestrictedAccess = async (req, res) => {
  try {
    const { reason, durationMinutes = 60 } = req.body;
    const file = await AcademicFile.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    const isPublished = !file.status || file.status === "APPROVED";
    if (!isPublished) {
      return res.status(400).json({ message: "File is not published yet" });
    }
    if (normalizeSensitivity(file.sensitivity) === "PUBLIC") {
      return res.status(400).json({ message: "Public file does not require request" });
    }

    const existing = await AccessRequest.findOne({
      user: req.user.userId,
      file: file._id,
      status: "PENDING"
    });
    if (existing) {
      return res.status(409).json({ message: "Pending request already exists" });
    }

    const requestDoc = await AccessRequest.create({
      user: req.user.userId,
      file: file._id,
      reason: reason || "",
      requestedDurationMinutes: Number(durationMinutes) || 60
    });

    await ActivityLog.create({
      user: req.user.userId,
      file: file._id,
      action: "REQUEST_ACCESS",
      ipAddress: req.ip,
      metadata: { requestId: String(requestDoc._id) }
    });

    res.status(201).json({ message: "Access request submitted", request: requestDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit request" });
  }
};

const getMyAccessRequests = async (req, res) => {
  try {
    const requests = await AccessRequest.find({ user: req.user.userId })
      .populate("file", "fileName subject sensitivity")
      .populate("reviewedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch access requests" });
  }
};

const getStudyFolders = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const folders = await StudyFolder.find({ user: studentId })
      .populate({
        path: "files",
        select: "fileName subject category semester department"
      })
      .sort({ createdAt: -1 });

    res.json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch study folders" });
  }
};

const createStudyFolder = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { name, subject = "" } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await StudyFolder.create({
      user: studentId,
      name: String(name).trim(),
      subject: String(subject || "").trim()
    });

    res.status(201).json(folder);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Folder with this name already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

const addFileToStudyFolder = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { folderId, fileId } = req.params;

    const folder = await StudyFolder.findOne({ _id: folderId, user: studentId });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const file = await AcademicFile.findById(fileId).select("_id fileName");
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const alreadySaved = folder.files.some((id) => String(id) === String(fileId));
    if (alreadySaved) {
      return res.status(409).json({ message: "File already exists in this folder" });
    }

    folder.files.push(fileId);
    await folder.save();

    res.json({ message: "File saved to study folder" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save file to folder" });
  }
};

const removeFileFromStudyFolder = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { folderId, fileId } = req.params;

    const folder = await StudyFolder.findOne({ _id: folderId, user: studentId });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    folder.files = folder.files.filter((id) => String(id) !== String(fileId));
    await folder.save();

    res.json({ message: "File removed from study folder" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove file from folder" });
  }
};

const getStudyPlan = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const items = await StudyPlanItem.find({ user: studentId })
      .populate("file", "fileName subject category semester department")
      .sort({ isCompleted: 1, reminderAt: 1, createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch study plan" });
  }
};

const addToStudyPlan = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { fileId } = req.params;
    const { reminderAt, note = "" } = req.body;

    const file = await AcademicFile.findById(fileId).select("_id");
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const existing = await StudyPlanItem.findOne({ user: studentId, file: fileId });
    if (existing) {
      return res.status(409).json({ message: "File already added to study plan" });
    }

    const item = await StudyPlanItem.create({
      user: studentId,
      file: fileId,
      reminderAt: reminderAt ? new Date(reminderAt) : undefined,
      note: String(note || "").trim()
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add file to study plan" });
  }
};

const updateStudyPlanItem = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { itemId } = req.params;
    const { reminderAt, note, isCompleted } = req.body;

    const item = await StudyPlanItem.findOne({ _id: itemId, user: studentId });
    if (!item) {
      return res.status(404).json({ message: "Study plan item not found" });
    }

    if (typeof isCompleted === "boolean") {
      item.isCompleted = isCompleted;
      item.completedAt = isCompleted ? new Date() : null;
    }

    if (typeof note === "string") {
      item.note = note.trim();
    }

    if (reminderAt !== undefined) {
      item.reminderAt = reminderAt ? new Date(reminderAt) : null;
    }

    await item.save();
    res.json({ message: "Study plan updated", item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update study plan item" });
  }
};

const deleteStudyPlanItem = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { itemId } = req.params;

    const deleted = await StudyPlanItem.findOneAndDelete({ _id: itemId, user: studentId });
    if (!deleted) {
      return res.status(404).json({ message: "Study plan item not found" });
    }

    res.json({ message: "Study plan item removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove study plan item" });
  }
};

module.exports = {
  getStudentFiles,
  getStudentMyStats,
  getStudentAccessGrid,
  getRecentAccess,
  getBookmarkedFiles,
  toggleBookmark,
  getRecentFiles,
  requestRestrictedAccess,
  getMyAccessRequests,
  getStudyFolders,
  createStudyFolder,
  addFileToStudyFolder,
  removeFileFromStudyFolder,
  getStudyPlan,
  addToStudyPlan,
  updateStudyPlanItem,
  deleteStudyPlanItem
};
