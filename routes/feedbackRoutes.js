const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["STUDENT"]),
  feedbackController.submitFeedback
);

module.exports = router;
