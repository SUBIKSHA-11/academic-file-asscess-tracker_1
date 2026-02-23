const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["ADMIN", "FACULTY", "STUDENT"],
      required: true,
    },
department: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
  required: true
},


    facultyId: {
      type: String,
      sparse: true,
    },

    studentId: {
      type: String,
      sparse: true,
    },

    year: {
      type: Number,
      min: 1,
      max: 4,
    },
    lastLoginDate: {
      type: Date
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    badges: [
      {
        name: { type: String, required: true },
        earnedAt: { type: Date, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
