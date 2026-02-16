const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Protect all admin routes
router.use(authMiddleware, roleMiddleware(["ADMIN"]));

router.get("/stats", adminController.getDashboardStats);
router.get("/top-files", adminController.getTopDownloadedFiles);
router.get("/category-distribution", adminController.getCategoryDistribution);
router.get("/department-distribution", adminController.getDepartmentDistribution);
router.get("/alerts", adminController.getAlerts);
router.post("/grant-access", adminController.grantTemporaryAccess);

module.exports = router;
