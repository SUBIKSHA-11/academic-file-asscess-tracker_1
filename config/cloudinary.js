const { v2: cloudinary } = require("cloudinary");

const cleanEnv = (value) => String(value || "").trim();

const parseCloudinaryUrl = (value) => {
  const normalized = cleanEnv(value);
  if (!normalized) return {};

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "cloudinary:") return {};

    return {
      cloud_name: cleanEnv(parsed.hostname),
      api_key: decodeURIComponent(parsed.username),
      api_secret: decodeURIComponent(parsed.password)
    };
  } catch {
    return {};
  }
};

const cloudinaryUrlConfig = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

const cloudinaryConfig = {
  cloud_name:
    cleanEnv(process.env.CLOUD_NAME) ||
    cleanEnv(process.env.CLOUDINARY_CLOUD_NAME) ||
    cloudinaryUrlConfig.cloud_name,
  api_key:
    cleanEnv(process.env.CLOUD_API_KEY) ||
    cleanEnv(process.env.CLOUDINARY_API_KEY) ||
    cloudinaryUrlConfig.api_key,
  api_secret:
    cleanEnv(process.env.CLOUD_API_SECRET) ||
    cleanEnv(process.env.CLOUDINARY_API_SECRET) ||
    cloudinaryUrlConfig.api_secret
};

cloudinary.config({
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key,
  api_secret: cloudinaryConfig.api_secret
});

cloudinary.isConfigured = Boolean(
  cloudinaryConfig.cloud_name &&
  cloudinaryConfig.api_key &&
  cloudinaryConfig.api_secret
);

cloudinary.configHelp =
  "Set CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET, or set CLOUDINARY_URL.";

module.exports = cloudinary;
