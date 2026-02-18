import { useEffect, useState } from "react";
import axios from "../api/axios";
import { AlertTriangle, Search, CheckCircle, Trash2 } from "lucide-react";

function Suspicious() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchAlerts();
  }, [severity, fromDate, toDate]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("/admin/alerts", {
        params: {
          severity,
          from: fromDate,
          to: toDate
        }
      });

      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markReviewed = async (id) => {
    await axios.patch(`/admin/alerts/${id}/review`);
    fetchAlerts();
  };

  const deleteAlert = async (id) => {
    await axios.delete(`/admin/alerts/${id}`);
    fetchAlerts();
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Suspicious Activity
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">

        {/* Search */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search user or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Severity</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        {/* Date Filters */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded"
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
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAlerts.map((alert) => (
              <tr
                key={alert._id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  {alert.user?.name}
                </td>

                <td className="p-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  {alert.reason}
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityStyle(alert.severity)}`}
                  >
                    {alert.severity}
                  </span>
                </td>

                <td className="p-3">
                  {alert.reviewed ? (
                    <span className="text-green-600 font-semibold">
                      Reviewed
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Pending
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {new Date(alert.createdAt).toLocaleString()}
                </td>

                <td className="p-3 flex justify-center gap-4">

                  {!alert.reviewed && (
                    <button
                      onClick={() => markReviewed(alert._id)}
                      className="text-green-600 hover:text-green-800"
                      title="Mark as Reviewed"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => deleteAlert(alert._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Alert"
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

export default Suspicious;
