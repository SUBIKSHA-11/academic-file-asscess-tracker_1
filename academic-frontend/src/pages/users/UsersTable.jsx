import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Trash2, Plus } from "lucide-react";

function UsersTable({ role }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    facultyId: "",
    studentId: "",
    year: ""
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("/admin/users");
    setUsers(res.data.filter((u) => u.role === role));
  };
  const fetchDepartments = async () => {
  try {
    const res = await axios.get("/departments");
    setDepartments(res.data.filter(d => d.isActive));
  } catch (err) {
    console.error("Department fetch failed", err);
  }
};


  const deleteUser = async (id) => {
    await axios.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("/auth/register", {
      ...form,
      role
    });

    setShowForm(false);
    fetchUsers();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {role} List
        </h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Add {role}
        </button>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

          <input
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
  <select
    name="department"
    value={form.department}
    onChange={handleChange}
    required
    className="border p-2 rounded"
  >
    <option value="">Select Department</option>

    {departments.map((dept) => (
      <option key={dept._id} value={dept._id}>
        {dept.name}
      </option>
    ))}
  </select>
          

          {role === "FACULTY" && (
            <input
              name="facultyId"
              placeholder="Faculty ID"
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
          )}

          {role === "STUDENT" && (
            <>
              <input
                name="studentId"
                placeholder="Student ID"
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />

              <select
                name="year"
                onChange={handleChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </>
          )}

          <button
            type="submit"
            className="col-span-full bg-blue-500 text-white py-2 rounded-lg"
          >
            Create {role}
          </button>
        </form>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>

              {role === "FACULTY" && (
                <th className="p-3 text-left">Faculty ID</th>
              )}

              {role === "STUDENT" && (
                <>
                  <th className="p-3 text-left">Student ID</th>
                  <th className="p-3 text-left">Year</th>
                </>
              )}

              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>

                {role === "FACULTY" && (
                  <td className="p-3">{user.facultyId || "-"}</td>
                )}

                {role === "STUDENT" && (
                  <>
                    <td className="p-3">{user.studentId || "-"}</td>
                    <td className="p-3">{user.year || "-"}</td>
                  </>
                )}

                <td className="p-3">{user.department?.name || "-"}</td>
                <td className="p-3">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;
