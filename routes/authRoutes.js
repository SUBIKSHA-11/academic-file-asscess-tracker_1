const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

router.get("/me", authMiddleware, authController.getMe);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
