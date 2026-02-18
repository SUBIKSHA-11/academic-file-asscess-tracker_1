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

    department: String,

    facultyId: {
      type: String,
      unique: true,
      sparse: true,
    },

    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    year: {
      type: Number,
      min: 1,
      max: 4,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
