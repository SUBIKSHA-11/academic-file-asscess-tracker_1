const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const allowedExtensions = [
  "pdf",
  "docx",
  "pptx",
  "xlsx",
  "jpg",
  "png",
  "mp4",
  "zip"
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).substring(1).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

module.exports = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter
});
