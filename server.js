require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;

// =============================
// CONNECT DATABASE
// =============================
connectDB();

// =============================
// MIDDLEWARES
// =============================
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Disable caching
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// =============================
// HEALTH CHECK (for Render)
// =============================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// =============================
// API ROUTES
// =============================
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

// =============================
// GLOBAL ERROR HANDLER
// =============================
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

  res.status(err?.status || 500).json({
    success: false,
    message,
  });
});

// =============================
// SERVE FRONTEND (PRODUCTION)
// =============================
const frontendDistPath = path.join(__dirname, "academic-frontend", "dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

if (process.env.NODE_ENV === "production" || fs.existsSync(frontendIndexPath)) {
  // Serve React build files
  app.use(express.static(frontendDistPath));

  // Keep missing API routes as API responses instead of returning the React app.
  app.use("/api", (req, res) => {
    res.status(404).json({
      success: false,
      message: "API route not found",
    });
  });

  // React Router fallback for direct visits/refreshes on client-side routes.
  app.use((req, res) => {
    res.sendFile(frontendIndexPath);
  });
}

// =============================
// START SERVER
// =============================
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
