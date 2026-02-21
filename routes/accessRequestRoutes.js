const express = require("express");
const router = express.Router();

const accessRequestController = require("../controllers/accessRequestController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware, roleMiddleware(["ADMIN", "FACULTY"]));

router.get("/", accessRequestController.getAccessRequests);
router.patch("/:id/approve", accessRequestController.approveAccessRequest);
router.patch("/:id/reject", accessRequestController.rejectAccessRequest);

module.exports = router;
