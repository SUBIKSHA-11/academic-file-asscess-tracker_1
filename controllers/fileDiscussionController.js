const AcademicFile = require("../models/AcademicFile");
const FileDiscussionComment = require("../models/FileDiscussionComment");

const canAccessDiscussion = async (user, fileId) => {
  const file = await AcademicFile.findById(fileId).select("uploadedBy status");
  if (!file) return { ok: false, status: 404, message: "File not found" };

  if (user.role === "FACULTY" && String(file.uploadedBy) !== String(user.userId || user.id)) {
    return { ok: false, status: 403, message: "Faculty can discuss only their own uploaded files" };
  }

  if (user.role === "STUDENT") {
    const status = file.status || "APPROVED";
    if (status !== "APPROVED") {
      return { ok: false, status: 403, message: "Discussion available only for approved files" };
    }
  }

  return { ok: true, file };
};

const getFileDiscussion = async (req, res) => {
  try {
    const { fileId } = req.params;
    const access = await canAccessDiscussion(req.user, fileId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const comments = await FileDiscussionComment.find({ file: fileId })
      .populate("user", "name role")
      .sort({ createdAt: 1 })
      .lean();

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch discussion" });
  }
};

const addDiscussionComment = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: "Comment message is required" });
    }

    const access = await canAccessDiscussion(req.user, fileId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const comment = await FileDiscussionComment.create({
      file: fileId,
      user: req.user.userId || req.user.id,
      role: req.user.role,
      message: String(message).trim()
    });

    const populated = await FileDiscussionComment.findById(comment._id)
      .populate("user", "name role")
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

module.exports = {
  getFileDiscussion,
  addDiscussionComment
};
