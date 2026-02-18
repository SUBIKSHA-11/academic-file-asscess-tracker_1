const express = require("express");
const router = express.Router();

const fileController = require("../controllers/fileController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Upload Route
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware(["ADMIN", "FACULTY"]),
  upload.single("file"),
  fileController.uploadFile,
);
// Get files route
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
// Advanced Filter Route
router.get(
  "/filter",
  authMiddleware,
  fileController.filterFiles
);
// Delete File
router.delete(
  "/:id",
  authMiddleware,
  fileController.deleteFile
);
// Inline View
router.get(
  "/view/:id",
  authMiddleware,
  fileController.viewFile
);

module.exports = router;
