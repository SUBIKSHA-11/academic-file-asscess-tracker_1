const AcademicFile = require("../models/AcademicFile");
const Department = require("../models/Department");
const ActivityLog = require("../models/ActivityLog");
const mongoose = require("mongoose");

const getStudentFiles = async (req, res) => {
  try {
    const files = await AcademicFile.find({ sensitivity: "PUBLIC" })
      .select("fileName semester category department subject downloadCount createdAt")
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

    const normalized = files.map((file) => ({
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
      createdAt: file.createdAt
    }));

    res.json(normalized);
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

    const [downloads, views, totalAccessResult, uniqueFiles, downloadsThisWeek, categoryAgg] = await Promise.all([
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
      ])
    ]);

    res.json({
      totalDownloads: downloads,
      totalViews: views,
      totalAccessActions: totalAccessResult,
      uniqueFilesAccessed: uniqueFiles.length,
      downloadsThisWeek,
      mostDownloadedCategory: categoryAgg[0]?._id || "N/A"
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
      user: req.user.id,
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

module.exports = {
  getStudentFiles,
  getStudentMyStats,
  getStudentAccessGrid,
  getRecentAccess
};
