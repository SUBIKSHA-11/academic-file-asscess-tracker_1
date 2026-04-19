const { v2: cloudinary } = require("cloudinary");

const parseCloudinaryUrl = (value) => {
  if (!value) return {};

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "cloudinary:") return {};

    return {
      cloud_name: parsed.hostname,
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
    process.env.CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    cloudinaryUrlConfig.cloud_name,
  api_key:
    process.env.CLOUD_API_KEY ||
    process.env.CLOUDINARY_API_KEY ||
    cloudinaryUrlConfig.api_key,
  api_secret:
    process.env.CLOUD_API_SECRET ||
    process.env.CLOUDINARY_API_SECRET ||
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
