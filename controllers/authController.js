const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      facultyId,
      studentId,
      year
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const usersCount = await User.countDocuments();
    let finalRole = role;
    let finalDepartment = department;

    // Bootstrap: if no user exists, allow creating the first admin account.
    if (usersCount === 0) {
      finalRole = "ADMIN";

      if (!finalDepartment) {
        let defaultDepartment = await Department.findOne({ name: "General" });
        if (!defaultDepartment) {
          defaultDepartment = await Department.create({ name: "General" });
        }
        finalDepartment = defaultDepartment._id;
      }
    } else {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Only admin can create users" });
      }

      const token = authHeader.split(" ")[1];
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      if (decoded.role !== "ADMIN") {
        return res.status(403).json({ message: "Only admin can create users" });
      }
    }

    if (!["ADMIN", "FACULTY", "STUDENT"].includes(finalRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!finalDepartment) {
      return res.status(400).json({ message: "Department is required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
      department: finalDepartment,
      facultyId: facultyId || undefined,
      studentId: studentId || undefined,
      year: year || null
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("department", "name")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Email and password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword
};
