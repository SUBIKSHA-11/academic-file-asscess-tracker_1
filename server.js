require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

connectDB();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Disable caching
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Simple health check for deployment platforms and smoke tests
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

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

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const message =
    err?.message ||
    err?.error?.message ||
    err?.error?.error?.message ||
    "Internal server error";

  return res.status(err?.status || 500).json({ message });
});

// Serve frontend (only if frontend inside backend repo)
if (process.env.NODE_ENV === "production") {

  const frontendDistPath = path.join(__dirname, "academic-frontend", "dist");

  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
