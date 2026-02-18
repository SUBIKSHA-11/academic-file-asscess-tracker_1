const Department = require("../models/Department");
const User = require("../models/User");
const AcademicFile = require("../models/AcademicFile");

// Create Department
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const dept = await Department.create({ name });

    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: "Failed to create department" });
  }
};

// Get All Departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};



// Department Analytics
const getDepartmentStats = async (req, res) => {
  try {
    const departments = await Department.find();

    const stats = await Promise.all(
      departments.map(async (dept) => {
        const facultyCount = await User.countDocuments({
          department: dept.name,
          role: "FACULTY"
        });

        const studentCount = await User.countDocuments({
          department: dept.name,
          role: "STUDENT"
        });

        const fileCount = await AcademicFile.countDocuments({
          department: dept.name
        });

        return {
          name: dept.name,
          isActive: dept.isActive,
          facultyCount,
          studentCount,
          fileCount
        };
      })
    );

    res.json(stats);

  } catch (error) {
    res.status(500).json({ message: "Failed" });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentStats
};
