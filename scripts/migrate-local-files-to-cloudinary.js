require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const AcademicFile = require("../models/AcademicFile");
const cloudinary = require("../config/cloudinary");

const isRemoteFilePath = (value) => /^https?:\/\//i.test(String(value || ""));

const isLikelyLocalFilePath = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return false;

  return (
    normalized.startsWith("uploads/") ||
    normalized.startsWith("uploads\\") ||
    /^[A-Za-z]:\\/.test(normalized) ||
    normalized.startsWith("/") ||
    normalized.includes("\\uploads\\")
  );
};

const resolveLocalFilePath = (filePath) => {
  if (!filePath) return null;
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(process.cwd(), filePath);
};

const sanitizeFileName = (value) =>
  String(value || "file")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "file";

const getArgValue = (flag) => {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
};

const shouldApply = process.argv.includes("--apply");
const limitArg = Number(getArgValue("--limit"));
const limit = Number.isFinite(limitArg) && limitArg > 0 ? Math.floor(limitArg) : null;

const ensureEnv = () => {
  const required = ["MONGO_URI", "CLOUD_NAME", "CLOUD_API_KEY", "CLOUD_API_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const uploadToCloudinary = async (localPath, originalName, fileId) => {
  const extension = path.extname(originalName).replace(".", "").toLowerCase();
  const publicIdBase = sanitizeFileName(originalName);

  return cloudinary.uploader.upload(localPath, {
    folder: "academic-files",
    resource_type: "raw",
    public_id: `${publicIdBase}-${fileId}${extension ? `.${extension}` : ""}`
  });
};

const main = async () => {
  ensureEnv();

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const files = await AcademicFile.find()
    .select("_id fileName filePath createdAt")
    .sort({ createdAt: 1 })
    .lean();

  const candidates = files.filter((file) => isLikelyLocalFilePath(file.filePath) && !isRemoteFilePath(file.filePath));
  const selected = limit ? candidates.slice(0, limit) : candidates;

  console.log(`Found ${files.length} total file records`);
  console.log(`Found ${candidates.length} local-path records`);
  console.log(`${shouldApply ? "Applying" : "Dry run"} on ${selected.length} record(s)`);

  const summary = {
    processed: 0,
    updated: 0,
    skippedMissing: 0,
    failed: 0
  };

  for (const file of selected) {
    summary.processed += 1;
    const localPath = resolveLocalFilePath(file.filePath);

    if (!localPath || !fs.existsSync(localPath)) {
      summary.skippedMissing += 1;
      console.log(`[SKIP] Missing file on disk: ${file.fileName} -> ${file.filePath}`);
      continue;
    }

    if (!shouldApply) {
      console.log(`[DRY RUN] Would migrate ${file.fileName}`);
      console.log(`          From: ${localPath}`);
      continue;
    }

    try {
      const result = await uploadToCloudinary(localPath, file.fileName, String(file._id));
      await AcademicFile.updateOne(
        { _id: file._id },
        { $set: { filePath: result.secure_url || result.url } }
      );

      summary.updated += 1;
      console.log(`[OK] Migrated ${file.fileName}`);
      console.log(`     URL: ${result.secure_url || result.url}`);
    } catch (error) {
      summary.failed += 1;
      console.error(`[FAIL] ${file.fileName}: ${error.message}`);
    }
  }

  console.log("Migration summary:", summary);

  await mongoose.disconnect();
  console.log("MongoDB disconnected");
};

main().catch(async (error) => {
  console.error("Migration aborted:", error.message);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
