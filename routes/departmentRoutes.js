const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const departmentController = require("../controllers/departmentController");

// Admin Only
router.use(authMiddleware, roleMiddleware(["ADMIN"]));

router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getDepartments);
router.get("/stats", departmentController.getDepartmentStats);

module.exports = router;
