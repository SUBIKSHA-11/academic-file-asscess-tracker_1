const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:id/ratings", authMiddleware, feedbackController.getFileRatings);

module.exports = router;
