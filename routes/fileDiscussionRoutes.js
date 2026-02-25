const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const discussionController = require("../controllers/fileDiscussionController");

router.use(authMiddleware, roleMiddleware(["ADMIN", "FACULTY", "STUDENT"]));

router.get("/:fileId", discussionController.getFileDiscussion);
router.post("/:fileId", discussionController.addDiscussionComment);

module.exports = router;
