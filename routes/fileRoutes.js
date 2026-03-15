const express = require("express");
const router = express.Router();

const fileController = require("../controllers/fileController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const uploadSingleFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      return next();
    }

    console.error("Upload middleware error:", error);

    const message =
      error?.message ||
      error?.error?.message ||
      error?.error?.error?.message ||
      "File upload failed";

    const statusCode =
      error?.name === "MulterError" || message === "Invalid file type" ? 400 : 500;

    return res.status(statusCode).json({ message });
  });
};

// Upload File
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware(["ADMIN", "FACULTY"]),
  uploadSingleFile,
  fileController.uploadFile
);

// Get files
router.get(
  "/",
  authMiddleware,
  fileController.getFiles
);

// Download file
router.get(
  "/download/:id",
  authMiddleware,
  fileController.downloadFile
);

// Filter files
router.get(
  "/filter",
  authMiddleware,
  fileController.filterFiles
);

// Pending files
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  fileController.getPendingFiles
);

// Approve file
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  fileController.approveFile
);

// Reject file
router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  fileController.rejectFile
);

// Version history
router.get(
  "/:id/versions",
  authMiddleware,
  fileController.getFileVersions
);

// Restore version
router.post(
  "/:id/restore",
  authMiddleware,
  roleMiddleware(["ADMIN", "FACULTY"]),
  fileController.restoreVersion
);

// Delete file
router.delete(
  "/:id",
  authMiddleware,
  fileController.deleteFile
);

// View file
router.get(
  "/view/:id",
  authMiddleware,
  fileController.viewFile
);

module.exports = router;
