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
router.get("/study-folders", studentController.getStudyFolders);
router.post("/study-folders", studentController.createStudyFolder);
router.post("/study-folders/:folderId/files/:fileId", studentController.addFileToStudyFolder);
router.delete("/study-folders/:folderId/files/:fileId", studentController.removeFileFromStudyFolder);
router.get("/study-plan", studentController.getStudyPlan);
router.post("/study-plan/:fileId", studentController.addToStudyPlan);
router.patch("/study-plan/:itemId", studentController.updateStudyPlanItem);
router.delete("/study-plan/:itemId", studentController.deleteStudyPlanItem);

module.exports = router;
