const fs = require("fs");
const path = require("path");

const isRemoteFilePath = (value) => /^https?:\/\//i.test(String(value || ""));

const resolveLocalFilePath = (filePath) => {
  if (!filePath) return null;

  if (path.isAbsolute(filePath)) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    const uploadsFallbackPath = path.resolve(process.cwd(), "uploads", path.basename(filePath));
    if (fs.existsSync(uploadsFallbackPath)) {
      return uploadsFallbackPath;
    }

    return filePath;
  }

  return path.resolve(filePath);
};

const isFileAvailable = (filePath) => {
  if (!filePath) return false;
  if (isRemoteFilePath(filePath)) return true;

  const resolvedPath = resolveLocalFilePath(filePath);
  return Boolean(resolvedPath && fs.existsSync(resolvedPath));
};

module.exports = {
  isRemoteFilePath,
  resolveLocalFilePath,
  isFileAvailable
};
