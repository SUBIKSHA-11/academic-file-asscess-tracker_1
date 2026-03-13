require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;
const frontendDistPath = path.join(__dirname, "academic-frontend", "dist");

connectDB();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
// Disable caching for API responses
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
// Static file access
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/access-requests", require("./routes/accessRequestRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/file", require("./routes/fileRatingRoutes"));
app.use("/api/discussions", require("./routes/fileDiscussionRoutes"));
app.use("/api", require("./routes/departmentRoutes"));
//app.use("/api/admin", require("./routes/departmentRoutes"));
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendDistPath));

  app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.listen(port, () => console.log(`Server running on port ${port}`));












