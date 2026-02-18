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
    const res = await axios.get("/admin/departments");
    setDepartments(res.data);
  };

  const addDepartment = async (e) => {
    e.preventDefault();
    await axios.post("/departments", { name });
    setName("");
    fetchDepartments();
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
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
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
                <td className="p-3 text-center">
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
