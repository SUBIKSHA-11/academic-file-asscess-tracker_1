const AcademicFile = require("../models/AcademicFile");

// Upload File and Save Metadata
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

    // Check file existence
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Create new file record
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

    res.status(201).json({
      message: "File uploaded and saved successfully",
      file: newFile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// Get Files Based on Role + Sensitivity
const getFiles = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "ADMIN") {
      // Admin sees all
      filter = {};
    }

    else if (req.user.role === "FACULTY") {
      filter = {
        sensitivity: { $in: ["PUBLIC", "INTERNAL"] }
      };
    }

    else if (req.user.role === "STUDENT") {
      filter = {
        sensitivity: "PUBLIC"
      };
    }

    const files = await AcademicFile.find(filter).populate("uploadedBy", "name role");

    res.json(files);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch files" });
  }
};
module.exports = {
  uploadFile,
  getFiles
};

