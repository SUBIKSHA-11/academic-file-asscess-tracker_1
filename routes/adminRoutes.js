const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware(["ADMIN"]));

router.get("/stats", adminController.getDashboardStats);
router.get("/top-files", adminController.getTopDownloadedFiles);
router.get("/category-distribution", adminController.getCategoryDistribution);
router.get("/department-distribution", adminController.getDepartmentDistribution);
router.get("/alerts", adminController.getAlerts);
router.post("/grant-access", adminController.grantTemporaryAccess);
router.get("/recent-activity", adminController.getRecentActivity);
router.get("/monthly-uploads", adminController.getMonthlyUploads);
router.get("/logs", adminController.getLogs);

/* NEW ROUTES */
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
