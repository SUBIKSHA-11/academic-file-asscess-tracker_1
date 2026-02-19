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



const getDepartmentStats = async (req, res) => {
  try {
    const departments = await Department.find();

    const result = await Promise.all(
      departments.map(async (dept) => {

        const facultyCount = await User.countDocuments({
          department: dept._id,
          role: "FACULTY"
        });

        const studentCount = await User.countDocuments({
          department: dept._id,
          role: "STUDENT"
        });

        const fileCount = await AcademicFile.countDocuments({
          department: dept._id,
        });

        return {
          _id: dept._id,
          name: dept.name,
          facultyCount,
          studentCount,
          fileCount,
          isActive: dept.isActive
        };
      })
    );

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed" });
  }
};const toggleDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);

    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    dept.isActive = !dept.isActive;
    await dept.save();

    res.json({ message: "Status updated", dept });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Toggle failed" });
  }
};


module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentStats,
  toggleDepartment
};
