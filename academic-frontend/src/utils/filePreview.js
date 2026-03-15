const PREVIEWABLE_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "gif", "webp", "mp4", "txt"]);
const PREVIEWABLE_MIME_PREFIXES = ["image/", "video/", "text/"];
const PREVIEWABLE_MIME_TYPES = new Set(["application/pdf"]);

const getExtension = (fileName = "") => {
  const parts = String(fileName).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const isPreviewableBlob = (blob, fileName) => {
  const extension = getExtension(fileName);
  if (PREVIEWABLE_EXTENSIONS.has(extension)) {
    return true;
  }

  const mimeType = String(blob?.type || "").toLowerCase();
  if (PREVIEWABLE_MIME_TYPES.has(mimeType)) {
    return true;
  }

  return PREVIEWABLE_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
};

const triggerDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName || "file");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

export const openFilePreview = ({ blob, fileName, previewWindow }) => {
  if (!isPreviewableBlob(blob, fileName)) {
    if (previewWindow) {
      previewWindow.close();
    }
    triggerDownload(blob, fileName);
    return {
      previewed: false,
      message: `Preview is not supported for .${getExtension(fileName) || "file"} files. Download started instead.`
    };
  }

  const fileUrl = window.URL.createObjectURL(blob);
  if (previewWindow) {
    previewWindow.location.href = fileUrl;
  } else {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }

  window.setTimeout(() => window.URL.revokeObjectURL(fileUrl), 60000);
  return { previewed: true, message: "" };
};
