import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Users,
  Trash2,
  UserCog
} from "lucide-react";

function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data);
    } catch (err) {}
  };

  const changeRole = async (id, role) => {
    await axios.patch(`/admin/users/${id}/role`, { role });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await axios.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Users size={22} />
        Users Management
      </h2>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3">{user.email}</td>

                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      changeRole(user._id, e.target.value)
                    }
                    className="border px-2 py-1 rounded text-sm"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="FACULTY">FACULTY</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </td>

                <td className="p-3">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3 flex justify-center gap-4">
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>

                  <UserCog size={18} className="text-orange-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;
