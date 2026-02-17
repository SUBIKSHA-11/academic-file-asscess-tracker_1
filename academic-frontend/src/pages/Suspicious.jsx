import { useEffect, useState } from "react";
import axios from "../api/axios";
import { AlertTriangle, Search } from "lucide-react";

function Suspicious() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("/admin/alerts");
      setAlerts(res.data);
    } catch (err) {}
  };

  const filteredAlerts = alerts.filter((alert) =>
    alert.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    alert.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-orange-100 text-orange-700";
      case "LOW":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRowStyle = (severity) => {
    if (severity === "HIGH") return "bg-red-50";
    return "";
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Suspicious Activity</h2>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md w-1/3 mb-6">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by user or reason..."
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
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredAlerts.map((alert) => (
              <tr
                key={alert._id}
                className={`border-b hover:bg-gray-50 ${getRowStyle(alert.severity)}`}
              >
                <td className="p-3 font-medium">
                  {alert.user?.name}
                </td>

                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-500" />
                    {alert.reason}
                  </div>
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityStyle(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                </td>

                <td className="p-3">
                  {new Date(alert.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Suspicious;
