const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware(["STUDENT"]));

router.get("/files", studentController.getStudentFiles);
router.get("/my-stats", studentController.getStudentMyStats);
router.get("/access-grid", studentController.getStudentAccessGrid);
router.get("/recent-access", studentController.getRecentAccess);
router.get("/recent-files", studentController.getRecentFiles);
router.get("/bookmarks", studentController.getBookmarkedFiles);
router.post("/bookmarks/:fileId", studentController.toggleBookmark);
router.post("/access-requests/:fileId", studentController.requestRestrictedAccess);
router.get("/access-requests", studentController.getMyAccessRequests);

module.exports = router;
