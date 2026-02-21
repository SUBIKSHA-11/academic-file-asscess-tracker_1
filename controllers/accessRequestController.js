const AccessRequest = require("../models/AccessRequest");
const TemporaryAccess = require("../models/TemporaryAccess");
const ActivityLog = require("../models/ActivityLog");

const getAccessRequests = async (req, res) => {
  try {
    const { status = "PENDING" } = req.query;
    const filter = {};
    if (status !== "ALL") {
      filter.status = status;
    }

    let requests = await AccessRequest.find(filter)
      .populate("user", "name email role")
      .populate("file", "fileName subject sensitivity uploadedBy department")
      .populate("reviewedBy", "name role")
      .sort({ createdAt: -1 });

    if (req.user.role === "FACULTY") {
      const me = String(req.user.userId);
      requests = requests.filter((item) => item.file && String(item.file.uploadedBy) === me);
    }

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch access requests" });
  }
};

const approveAccessRequest = async (req, res) => {
  try {
    const { durationMinutes = 60, note } = req.body;
    const accessRequest = await AccessRequest.findById(req.params.id).populate(
      "file",
      "uploadedBy status fileName"
    );

    if (!accessRequest || !accessRequest.file) {
      return res.status(404).json({ message: "Access request not found" });
    }

    if (accessRequest.status !== "PENDING") {
      return res.status(400).json({ message: "Request already processed" });
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwnerFaculty =
      req.user.role === "FACULTY" &&
      String(accessRequest.file.uploadedBy) === String(req.user.userId);
    if (!isAdmin && !isOwnerFaculty) {
      return res.status(403).json({ message: "Access denied" });
    }

    const expiresAt = new Date(Date.now() + Number(durationMinutes || 60) * 60000);
    await TemporaryAccess.create({
      user: accessRequest.user,
      file: accessRequest.file._id,
      expiresAt
    });

    accessRequest.status = "APPROVED";
    accessRequest.expiresAt = expiresAt;
    accessRequest.reviewedBy = req.user.userId;
    accessRequest.reviewedAt = new Date();
    accessRequest.reviewNote = note || "";
    await accessRequest.save();

    await ActivityLog.create({
      user: req.user.userId,
      file: accessRequest.file._id,
      action: "APPROVE_ACCESS",
      ipAddress: req.ip,
      metadata: { requestId: String(accessRequest._id), expiresAt: expiresAt.toISOString() }
    });

    res.json({ message: "Access request approved", request: accessRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve request" });
  }
};

const rejectAccessRequest = async (req, res) => {
  try {
    const { note } = req.body;
    const accessRequest = await AccessRequest.findById(req.params.id).populate("file", "uploadedBy");

    if (!accessRequest || !accessRequest.file) {
      return res.status(404).json({ message: "Access request not found" });
    }

    if (accessRequest.status !== "PENDING") {
      return res.status(400).json({ message: "Request already processed" });
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwnerFaculty =
      req.user.role === "FACULTY" &&
      String(accessRequest.file.uploadedBy) === String(req.user.userId);
    if (!isAdmin && !isOwnerFaculty) {
      return res.status(403).json({ message: "Access denied" });
    }

    accessRequest.status = "REJECTED";
    accessRequest.reviewedBy = req.user.userId;
    accessRequest.reviewedAt = new Date();
    accessRequest.reviewNote = note || "Rejected";
    await accessRequest.save();

    await ActivityLog.create({
      user: req.user.userId,
      file: accessRequest.file._id,
      action: "REJECT_ACCESS",
      ipAddress: req.ip,
      metadata: { requestId: String(accessRequest._id), note: accessRequest.reviewNote }
    });

    res.json({ message: "Access request rejected", request: accessRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reject request" });
  }
};

module.exports = {
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest
};
