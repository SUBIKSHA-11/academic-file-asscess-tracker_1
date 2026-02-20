const express = require("express");
const router = express.Router();

const facultyController = require("../controllers/facultyController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware(["FACULTY"]));

router.get("/my-stats", facultyController.getFacultyStats);
router.get("/my-files", facultyController.getMyFiles);
router.get("/all-files", facultyController.getAllFiles);
router.get("/category-distribution", facultyController.getCategoryDistribution);
router.get("/monthly-uploads", facultyController.getMonthlyUploads);
router.get("/recent-uploads", facultyController.getRecentUploads);

module.exports = router;
