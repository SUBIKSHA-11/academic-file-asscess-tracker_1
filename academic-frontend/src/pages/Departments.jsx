import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Plus } from "lucide-react";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

const fetchDepartments = async () => {
  try {
    const res = await axios.get("/departments/stats");
    setDepartments(res.data);
  } catch (err) {
    console.error("Department fetch failed", err);
  }
};


  const addDepartment = async (e) => {
    e.preventDefault();
    await axios.post("/departments", { name });
    setName("");
    fetchDepartments();
  };
const toggleDepartment = async (id) => {
  try {
    await axios.patch(`/admin/departments/${id}/toggle`);
    fetchDepartments();
  } catch (error) {
    console.error("Toggle failed", error);
  }
};


  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Department Management
      </h2>

      {/* Add Department */}
      <form
        onSubmit={addDepartment}
        className="flex gap-4 mb-8"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Department Name"
          required
          className="border p-2 rounded w-64"
        />

        <button
          type="submit"
          className="bg-[#0C3C01] text-[#F1F2ED] px-4 py-2 rounded hover:bg-[#5B6D49] transition-colors"
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-[#DFD9D8] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#2E2D1D] text-[#F1F2ED]">
            <tr>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Faculty</th>
              <th className="p-3 text-left">Students</th>
              <th className="p-3 text-left">Files</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {departments.map((dept) => (
              <tr key={dept.name} className="border-b">
                <td className="p-3">{dept.name}</td>
                <td className="p-3">{dept.facultyCount}</td>
                <td className="p-3">{dept.studentCount}</td>
                <td className="p-3">{dept.fileCount}</td>
                <td className="p-3">
                  {dept.isActive ? "Active" : "Disabled"}
                </td>
                <td className="p-3">
  <div className="flex justify-center">
    <button
      onClick={() => toggleDepartment(dept._id)}
      className={`px-4 py-1 rounded-lg text-white text-sm transition ${
        dept.isActive
          ? "bg-[#B44446] hover:bg-[#64242F]"
          : "bg-[#5B6D49] hover:bg-[#0C3C01]"
      }`}
    >
      {dept.isActive ? "Disable" : "Activate"}
    </button>
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Departments;
