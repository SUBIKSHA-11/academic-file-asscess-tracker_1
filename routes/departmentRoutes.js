const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware(["ADMIN"]));

router.post("/departments", departmentController.createDepartment);
router.get("/departments", departmentController.getDepartments);
router.get("/departments/stats", departmentController.getDepartmentStats);

module.exports = router;
