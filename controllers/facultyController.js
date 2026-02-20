const mongoose = require("mongoose");
const AcademicFile = require("../models/AcademicFile");

const getFacultyStats = async (req, res) => {
  try {
    const facultyId = new mongoose.Types.ObjectId(req.user.id);

    const [totals] = await AcademicFile.aggregate([
      {
        $match: { uploadedBy: facultyId }
      },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalDownloads: { $sum: "$downloadCount" },
          publicFiles: {
            $sum: {
              $cond: [{ $eq: ["$sensitivity", "PUBLIC"] }, 1, 0]
            }
          },
          internalFiles: {
            $sum: {
              $cond: [{ $eq: ["$sensitivity", "INTERNAL"] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      totalFiles: totals?.totalFiles || 0,
      totalDownloads: totals?.totalDownloads || 0,
      publicFiles: totals?.publicFiles || 0,
      internalFiles: totals?.internalFiles || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch faculty stats" });
  }
};

const getMyFiles = async (req, res) => {
  try {
    const files = await AcademicFile.find({ uploadedBy: req.user.id })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch faculty files" });
  }
};

const getCategoryDistribution = async (req, res) => {
  try {
    const facultyId = new mongoose.Types.ObjectId(req.user.id);
    const result = await AcademicFile.aggregate([
      {
        $match: { uploadedBy: facultyId }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch category distribution" });
  }
};

const getMonthlyUploads = async (req, res) => {
  try {
    const facultyId = new mongoose.Types.ObjectId(req.user.id);
    const result = await AcademicFile.aggregate([
      {
        $match: { uploadedBy: facultyId }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch monthly uploads" });
  }
};

const getRecentUploads = async (req, res) => {
  try {
    const files = await AcademicFile.find({ uploadedBy: req.user.id })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recent uploads" });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {
      sensitivity: { $in: ["PUBLIC", "INTERNAL"] }
    };

    if (department) {
      filter.department = department;
    }

    const files = await AcademicFile.find(filter)
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch files" });
  }
};

module.exports = {
  getFacultyStats,
  getMyFiles,
  getAllFiles,
  getCategoryDistribution,
  getMonthlyUploads,
  getRecentUploads
};
