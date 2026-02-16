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
  fileController.uploadFile
);
// Get files route
router.get(
  "/",
  authMiddleware,
  fileController.getFiles
);

module.exports = router;
