const User = require("../models/User");
const AcademicFile = require("../models/AcademicFile");
const Alert = require("../models/Alert");

// Dashboard Summary
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFaculty = await User.countDocuments({ role: "FACULTY" });
    const totalStudents = await User.countDocuments({ role: "STUDENT" });
    const totalFiles = await AcademicFile.countDocuments();

    res.json({
      totalUsers,
      totalFaculty,
      totalStudents,
      totalFiles
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// Top Downloaded Files
const getTopDownloadedFiles = async (req, res) => {
  try {
    const files = await AcademicFile.find()
      .sort({ downloadCount: -1 })
      .limit(5);

    res.json(files);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch top files" });
  }
};

// Category Distribution
const getCategoryDistribution = async (req, res) => {
  try {
    const result = await AcademicFile.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch category distribution" });
  }
};

// Department Distribution
const getDepartmentDistribution = async (req, res) => {
  try {
    const result = await AcademicFile.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch department distribution" });
  }
};

// Get Alerts
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().populate("user", "name email role");

    res.json(alerts);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};
const TemporaryAccess = require("../models/TemporaryAccess");

// Grant Temporary Access
const grantTemporaryAccess = async (req, res) => {
  try {
    const { userId, fileId, durationMinutes } = req.body;

    const expiresAt = new Date(Date.now() + durationMinutes * 60000);

    await TemporaryAccess.create({
      user: userId,
      file: fileId,
      expiresAt
    });

    res.json({ message: "Temporary access granted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Grant failed" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["ADMIN", "FACULTY", "STUDENT"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};
const ActivityLog = require("../models/ActivityLog");

const getAllLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("user", "name role")
      .populate("file", "fileName")
      .sort({ createdAt: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};


module.exports = {
  getDashboardStats,
  getTopDownloadedFiles,
  getCategoryDistribution,
  getDepartmentDistribution,
  getAlerts,
  grantTemporaryAccess,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllLogs
};


