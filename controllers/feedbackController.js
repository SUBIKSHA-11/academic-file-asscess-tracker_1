const mongoose = require("mongoose");
const AcademicFile = require("../models/AcademicFile");
const FileFeedback = require("../models/FileFeedback");

const calculateFeedbackStats = async (fileId) => {
  const objectId = new mongoose.Types.ObjectId(fileId);
  const [stats] = await FileFeedback.aggregate([
    { $match: { fileId: objectId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        totalHelpful: {
          $sum: {
            $cond: [{ $eq: ["$isHelpful", true] }, 1, 0]
          }
        }
      }
    }
  ]);

  const avgRating = stats?.avgRating ? Number(stats.avgRating.toFixed(2)) : 0;
  const totalRatings = stats?.totalRatings || 0;
  const totalHelpful = stats?.totalHelpful || 0;
  const helpfulPercentage = totalRatings
    ? Number(((totalHelpful / totalRatings) * 100).toFixed(2))
    : 0;

  await AcademicFile.findByIdAndUpdate(fileId, {
    avgRating,
    totalRatings,
    totalHelpful,
    helpfulPercentage
  });

  return { avgRating, totalRatings, totalHelpful, helpfulPercentage };
};

const submitFeedback = async (req, res) => {
  try {
    const { fileId, rating, isHelpful, comment } = req.body;
    const normalizedRating = Number(rating);

    if (!fileId || !Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ message: "Valid fileId and rating (1-5) are required" });
    }

    if (typeof isHelpful !== "boolean") {
      return res.status(400).json({ message: "isHelpful must be true or false" });
    }

    const file = await AcademicFile.findById(fileId).select("_id");
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const feedback = await FileFeedback.findOneAndUpdate(
      { fileId, userId: req.user.userId },
      {
        rating: normalizedRating,
        isHelpful,
        comment: comment || ""
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    const stats = await calculateFeedbackStats(fileId);

    res.json({
      message: "Feedback saved successfully",
      feedback,
      ...stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save feedback" });
  }
};

const getFileRatings = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await AcademicFile.findById(fileId)
      .select("avgRating totalRatings helpfulPercentage totalHelpful");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const myFeedback = await FileFeedback.findOne({
      fileId,
      userId: req.user.userId
    }).select("rating isHelpful comment createdAt updatedAt");

    res.json({
      avgRating: file.avgRating || 0,
      totalRatings: file.totalRatings || 0,
      helpfulPercentage: file.helpfulPercentage || 0,
      totalHelpful: file.totalHelpful || 0,
      myFeedback: myFeedback || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch file ratings" });
  }
};

module.exports = {
  submitFeedback,
  getFileRatings
};
