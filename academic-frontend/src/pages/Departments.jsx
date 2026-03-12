import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Plus } from "lucide-react";
import Pagination from "../components/Pagination";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(departments.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  async function fetchDepartments() {
    try {
      const res = await axios.get("/departments/stats");
      setDepartments(res.data);
    } catch (err) {
      console.error("Department fetch failed", err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDepartments();
  }, []);


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

  const start = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedDepartments = departments.slice(start, start + rowsPerPage);


  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">
        Department Management
      </h2>

      {/* Add Department */}
      <form
        onSubmit={addDepartment}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Department Name"
          required
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm sm:w-64"
        />

        <button
          type="submit"
          className="flex w-full items-center justify-center rounded bg-[#0C3C01] px-4 py-2 text-[#F1F2ED] transition-colors hover:bg-[#0C3C01] sm:w-auto"
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#DFD9D8] bg-white shadow-md">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="sticky top-0 bg-[#0C3C01] text-[#F1F2ED]">
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
            {paginatedDepartments.map((dept, index) => (
              <tr key={dept.name} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
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
          : "bg-[#0C3C01] hover:bg-[#0C3C01]"
      }`}
    >
      {dept.isActive ? "Disable" : "Activate"}
    </button>
  </div>
</td>

              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No departments found. Add your first department to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

export default Departments;
