import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Search,
  Activity
} from "lucide-react";

function AccessLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/admin/logs");
      setLogs(res.data);
    } catch (err) {}
  };

  const filteredLogs = logs.filter((log) =>
    log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action) => {
    switch (action) {
      case "UPLOAD":
        return "text-green-600";
      case "DOWNLOAD":
        return "text-orange-600";
      case "DELETE":
        return "text-red-600";
      case "VIEW":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Access Logs</h2>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md w-1/3 mb-6">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by user or action..."
          className="outline-none w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">IP Address</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{log.user?.name}</td>
                <td className="p-3">{log.user?.role}</td>

                <td className={`p-3 font-semibold ${getActionColor(log.action)}`}>
                  <div className="flex items-center gap-2">
                    <Activity size={14} />
                    {log.action}
                  </div>
                </td>

                <td className="p-3">{log.file?.fileName}</td>
                <td className="p-3">{log.ipAddress}</td>
                <td className="p-3">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccessLogs;
